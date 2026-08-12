import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

type AccessTokenPayload = {
  sub: string | number;
  role: string;
  email: string;
  typ?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException({
        message: 'Invalid token type',
        error: { code: 'INVALID_TOKEN', details: null },
      });
    }
    const user = await this.usersService.findById(Number(payload.sub));
    if (!user || user.deleted_at || user.status === UserStatus.BANNED) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        error: { code: 'UNAUTHORIZED', details: null },
      });
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
