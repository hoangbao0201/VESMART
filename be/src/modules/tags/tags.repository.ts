import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TagCreateInput) {
    return this.prisma.tag.create({ data });
  }

  findBySlug(slug: string) {
    return this.prisma.tag.findFirst({ where: { slug, deleted_at: null } });
  }

  findById(id: number) {
    return this.prisma.tag.findFirst({ where: { id, deleted_at: null } });
  }

  update(id: number, data: Prisma.TagUpdateInput) {
    return this.prisma.tag.update({ where: { id }, data });
  }

  softDelete(id: number) {
    return this.prisma.tag.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.TagWhereInput;
    orderBy?: Prisma.TagOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tag.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
      }),
      this.prisma.tag.count({ where }),
    ]);
    return { items, total };
  }
}
