import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, UserRole } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { AuditService } from '../audit/audit.service';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async getMe(userId: number) {
    const user = await this.usersRepository.findPublicById(userId);
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND', details: null },
      });
    }
    return toCamel(user);
  }

  async updateMe(userId: number, dto: UpdateMeDto) {
    if (dto.username) {
      const existing = await this.usersRepository.findByUsername(dto.username);
      if (existing && existing.id !== userId) {
        throw new ConflictException({
          message: 'Username already taken',
          error: { code: 'USERNAME_TAKEN', details: null },
        });
      }
    }
    try {
      const user = await this.usersRepository.update(userId, {
        full_name: dto.fullName,
        avatar: dto.avatar,
        username: dto.username,
      });
      return toCamel(user);
    } catch (error) {
      handlePrismaError(error, 'Username already taken');
    }
  }

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { username: { contains: query.search, mode: 'insensitive' } },
              { full_name: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy = parseSort(
      query.sort,
      ['created_at', 'username', 'email'],
      { field: 'created_at', direction: 'desc' },
    );
    const { items, total } = await this.usersRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findPublicById(id);
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND', details: null },
      });
    }
    return toCamel(user);
  }

  async findPublicByUsername(username: string) {
    const user = await this.usersRepository.findPublicByUsername(username);
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND', details: null },
      });
    }
    return toCamel(user);
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    actorId: number,
    ip?: string,
  ) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND', details: null },
      });
    }
    try {
      const user = await this.usersRepository.update(id, {
        full_name: dto.fullName,
        avatar: dto.avatar,
        username: dto.username,
        role: dto.role,
        status: dto.status,
      });
      let action: AuditAction = AuditAction.UPDATE;
      if (dto.status === 'BANNED' && existing.status !== 'BANNED') {
        action = AuditAction.BAN_USER;
      } else if (
        existing.status === 'BANNED' &&
        dto.status &&
        dto.status !== 'BANNED'
      ) {
        action = AuditAction.UNBAN_USER;
      }
      await this.auditService.log({
        actorId,
        action,
        entityType: 'User',
        entityId: id,
        ip,
        metadata: dto as unknown as Prisma.InputJsonValue,
      });
      return toCamel(user);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // helpers used by auth
  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findByUsername(username: string) {
    return this.usersRepository.findByUsername(username);
  }

  findById(id: number) {
    return this.usersRepository.findById(id);
  }

  createUser(data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    role?: UserRole;
  }) {
    return this.usersRepository.create({
      email: data.email,
      username: data.username,
      password: data.password,
      full_name: data.full_name,
      role: data.role,
    });
  }

  touchLastLogin(id: number) {
    return this.usersRepository.touchLastLogin(id);
  }
}
