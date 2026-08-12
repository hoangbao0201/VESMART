import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  findBySlug(slug: string) {
    return this.prisma.category.findFirst({
      where: { slug, deleted_at: null },
    });
  }

  findById(id: number) {
    return this.prisma.category.findFirst({
      where: { id, deleted_at: null },
    });
  }

  update(id: number, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({ where: { id }, data });
  }

  softDelete(id: number) {
    return this.prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  findAllActive(orderBy?: Prisma.CategoryOrderByWithRelationInput) {
    return this.prisma.category.findMany({
      where: { deleted_at: null },
      orderBy: orderBy ?? { sort_order: 'asc' },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
      }),
      this.prisma.category.count({ where }),
    ]);
    return { items, total };
  }
}
