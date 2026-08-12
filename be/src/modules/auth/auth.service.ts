import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditAction, OAuthProvider, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { toCamel } from '../../common/utils/case';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    );
  }

  private sanitizeUser(user: {
    id: number;
    email: string;
    username: string;
    full_name: string | null;
    avatar: string | null;
    role: string;
    status: string;
  }) {
    return toCamel({
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
    });
  }

  private async signTokens(user: {
    id: number;
    email: string;
    role: string;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(
      { ...payload, typ: 'access' },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '7d') as `${number}d`,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, typ: 'refresh' },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '365d',
        ) as `${number}d`,
      },
    );
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto, ip?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const emailExists = await this.usersService.findByEmail(normalizedEmail);
    if (emailExists) {
      throw new ConflictException({
        message: 'Email already registered',
        error: { code: 'EMAIL_TAKEN', details: null },
      });
    }
    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists) {
      throw new ConflictException({
        message: 'Username already taken',
        error: { code: 'USERNAME_TAKEN', details: null },
      });
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email: normalizedEmail,
      username: dto.username,
      password,
      full_name: dto.fullName,
    });
    const tokens = await this.signTokens(user);
    await this.auditService.log({
      actorId: user.id,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: user.id,
      ip,
    });
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: { code: 'INVALID_CREDENTIALS', details: null },
      });
    }
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException({
        message: 'Account is banned',
        error: { code: 'USER_BANNED', details: null },
      });
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException({
        message: 'Account is inactive',
        error: { code: 'USER_INACTIVE', details: null },
      });
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: { code: 'INVALID_CREDENTIALS', details: null },
      });
    }

    await this.usersService.touchLastLogin(user.id);
    await this.auditService.log({
      actorId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ip,
      userAgent,
    });

    const tokens = await this.signTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string | number;
        email: string;
        role: string;
        typ?: string;
      }>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.typ && payload.typ !== 'refresh') {
        throw new UnauthorizedException({
          message: 'Invalid refresh token',
          error: { code: 'INVALID_TOKEN', details: null },
        });
      }
      const user = await this.usersService.findById(Number(payload.sub));
      if (!user || user.status === UserStatus.BANNED) {
        throw new UnauthorizedException({
          message: 'Invalid refresh token',
          error: { code: 'INVALID_TOKEN', details: null },
        });
      }
      const tokens = await this.signTokens(user);
      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        error: { code: 'INVALID_TOKEN', details: null },
      });
    }
  }

  async me(userId: number) {
    return this.usersService.getMe(userId);
  }

  async logout(userId: number, ip?: string) {
    await this.auditService.log({
      actorId: userId,
      action: AuditAction.LOGOUT,
      entityType: 'User',
      entityId: userId,
      ip,
    });
    return null;
  }

  private async uniqueUsername(seed: string) {
    const cleaned = seed.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40);
    const base = cleaned.length >= 3 ? cleaned : `user${cleaned || 'g'}`;
    let candidate = base.slice(0, 50);
    let n = 0;
    while (await this.usersService.findByUsername(candidate)) {
      n += 1;
      const suffix = String(n);
      candidate = `${base.slice(0, Math.max(3, 50 - suffix.length))}${suffix}`;
    }
    return candidate;
  }

  async loginWithGoogle(idToken: string, ip?: string, userAgent?: string) {
    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
      picture?: string;
    };
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid Google token',
        error: { code: 'INVALID_GOOGLE_TOKEN', details: null },
      });
    }

    const providerUserId = payload.sub;
    const email = payload.email?.toLowerCase();
    if (!providerUserId || !email) {
      throw new UnauthorizedException({
        message: 'Google account missing email',
        error: { code: 'GOOGLE_EMAIL_REQUIRED', details: null },
      });
    }
    if (payload.email_verified === false || payload.email_verified === 'false') {
      throw new UnauthorizedException({
        message: 'Google email is not verified',
        error: { code: 'GOOGLE_EMAIL_UNVERIFIED', details: null },
      });
    }

    const existingOauth = await this.prisma.oAuthAccount.findFirst({
      where: {
        provider: OAuthProvider.GOOGLE,
        provider_user_id: providerUserId,
        deleted_at: null,
      },
    });

    let user =
      existingOauth != null
        ? await this.usersService.findById(existingOauth.user_id)
        : null;

    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        await this.prisma.oAuthAccount.create({
          data: {
            user_id: user.id,
            provider: OAuthProvider.GOOGLE,
            provider_user_id: providerUserId,
          },
        });
        if ((!user.avatar && payload.picture) || (!user.full_name && payload.name)) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              ...(user.avatar || !payload.picture
                ? {}
                : { avatar: payload.picture }),
              ...(user.full_name || !payload.name
                ? {}
                : { full_name: payload.name }),
            },
          });
          user = (await this.usersService.findById(user.id)) ?? user;
        }
      } else {
        const username = await this.uniqueUsername(
          email.split('@')[0] || `g${providerUserId.slice(0, 8)}`,
        );
        const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
        const created = await this.usersService.createUser({
          email,
          username,
          password,
          full_name: payload.name,
        });
        if (payload.picture) {
          await this.prisma.user.update({
            where: { id: created.id },
            data: { avatar: payload.picture },
          });
        }
        await this.prisma.oAuthAccount.create({
          data: {
            user_id: created.id,
            provider: OAuthProvider.GOOGLE,
            provider_user_id: providerUserId,
          },
        });
        user = (await this.usersService.findById(created.id)) ?? null;
      }
    }

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unable to sign in with Google',
        error: { code: 'GOOGLE_AUTH_FAILED', details: null },
      });
    }
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException({
        message: 'Account is banned',
        error: { code: 'USER_BANNED', details: null },
      });
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException({
        message: 'Account is inactive',
        error: { code: 'USER_INACTIVE', details: null },
      });
    }

    await this.usersService.touchLastLogin(user.id);
    await this.auditService.log({
      actorId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ip,
      userAgent,
    });

    const tokens = await this.signTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }
}
