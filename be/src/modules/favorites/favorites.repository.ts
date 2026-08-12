import { Injectable } from '@nestjs/common';
import { Prisma, TargetType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.FavoriteCreateInput) {
    return this.prisma.favorite.create({ data });
  }

  findById(id: number) {
    return this.prisma.favorite.findFirst({
      where: { id, deleted_at: null },
    });
  }

  findOne(userId: number, targetType: TargetType, targetId: number) {
    return this.prisma.favorite.findFirst({
      where: {
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        deleted_at: null,
      },
    });
  }

  softDelete(id: number) {
    return this.prisma.favorite.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.FavoriteWhereInput;
    orderBy?: Prisma.FavoriteOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.favorite.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
      }),
      this.prisma.favorite.count({ where }),
    ]);
    return { items, total };
  }

  findProductsByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.product.findMany({
      where: { id: { in: ids }, deleted_at: null },
      select: {
        id: true,
        slug: true,
        name: true,
        short_description: true,
        thumbnail: true,
        featured: true,
        brand: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { deleted_at: null, status: 'ACTIVE' },
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true, sale_price: true },
        },
      },
    });
  }

  findPostsByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.post.findMany({
      where: { id: { in: ids }, deleted_at: null },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        thumbnail: true,
        published_at: true,
        views: true,
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, username: true, avatar: true } },
      },
    });
  }

  findThreadsByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.thread.findMany({
      where: { id: { in: ids }, deleted_at: null },
      select: {
        id: true,
        slug: true,
        title: true,
        views: true,
        reply_count: true,
        is_pinned: true,
        is_locked: true,
        last_reply_at: true,
        created_at: true,
        forum: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, username: true, avatar: true } },
        last_reply_user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }
}
