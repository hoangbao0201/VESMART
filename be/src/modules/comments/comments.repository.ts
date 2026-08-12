import { Injectable } from '@nestjs/common';
import { CommentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CommentCreateInput) {
    return this.prisma.comment.create({
      data,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });
  }

  findById(id: number) {
    return this.prisma.comment.findFirst({
      where: { id, deleted_at: null },
    });
  }

  update(id: number, data: Prisma.CommentUpdateInput) {
    return this.prisma.comment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });
  }

  softDelete(id: number) {
    return this.prisma.comment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.CommentWhereInput;
    orderBy?: Prisma.CommentOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          children: {
            where: { deleted_at: null, status: CommentStatus.APPROVED },
            include: {
              user: { select: { id: true, username: true, avatar: true } },
            },
            orderBy: { created_at: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return { items, total };
  }
}
