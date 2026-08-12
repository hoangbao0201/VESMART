import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.BrandCreateInput) {
    return this.prisma.brand.create({ data });
  }

  findBySlug(slug: string) {
    return this.prisma.brand.findFirst({ where: { slug, deleted_at: null } });
  }

  findById(id: number) {
    return this.prisma.brand.findFirst({ where: { id, deleted_at: null } });
  }

  update(id: number, data: Prisma.BrandUpdateInput) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  softDelete(id: number) {
    return this.prisma.brand.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.BrandWhereInput;
    orderBy?: Prisma.BrandOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
      }),
      this.prisma.brand.count({ where }),
    ]);
    return { items, total };
  }
}
