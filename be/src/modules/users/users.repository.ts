import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const userPublicSelect = {
  id: true,
  email: true,
  username: true,
  full_name: true,
  avatar: true,
  status: true,
  role: true,
  last_login_at: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  readonly publicSelect = userPublicSelect;

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deleted_at: null },
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: { username, deleted_at: null },
    });
  }

  findById(id: number) {
    return this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
  }

  findPublicById(id: number) {
    return this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      select: userPublicSelect,
    });
  }

  findPublicByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: { username, deleted_at: null, status: UserStatus.ACTIVE },
      select: {
        id: true,
        username: true,
        full_name: true,
        avatar: true,
        role: true,
        status: true,
        created_at: true,
        last_login_at: true,
      },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: userPublicSelect,
    });
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
        select: userPublicSelect,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  touchLastLogin(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { last_login_at: new Date() },
    });
  }

  setStatus(id: number, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: userPublicSelect,
    });
  }
}
