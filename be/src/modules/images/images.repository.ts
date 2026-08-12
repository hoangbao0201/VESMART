import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ImagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  createCategory(data: Prisma.ImageCategoryCreateInput) {
    return this.prisma.imageCategory.create({ data });
  }

  updateCategory(id: number, data: Prisma.ImageCategoryUpdateInput) {
    return this.prisma.imageCategory.update({ where: { id }, data });
  }

  softDeleteCategory(id: number) {
    return this.prisma.imageCategory.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  findCategoryById(id: number) {
    return this.prisma.imageCategory.findFirst({
      where: { id, deleted_at: null },
    });
  }

  findCategoryBySlug(slug: string) {
    return this.prisma.imageCategory.findFirst({
      where: { slug, deleted_at: null },
    });
  }

  findAllCategories() {
    return this.prisma.imageCategory.findMany({
      where: { deleted_at: null },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
    });
  }

  countImagesInCategory(categoryId: number) {
    return this.prisma.image.count({
      where: { category_id: categoryId, deleted_at: null },
    });
  }

  countChildCategories(parentId: number) {
    return this.prisma.imageCategory.count({
      where: { parent_id: parentId, deleted_at: null },
    });
  }

  createImage(data: Prisma.ImageCreateInput) {
    return this.prisma.image.create({ data });
  }

  findImageById(id: number) {
    return this.prisma.image.findFirst({
      where: { id, deleted_at: null },
      include: { category: true },
    });
  }

  findImageBySourceUrl(sourceUrl: string) {
    return this.prisma.image.findFirst({
      where: { source_url: sourceUrl, deleted_at: null },
    });
  }

  softDeleteImage(id: number) {
    return this.prisma.image.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findImages(params: {
    skip: number;
    take: number;
    where?: Prisma.ImageWhereInput;
    orderBy?: Prisma.ImageOrderByWithRelationInput;
  }) {
    const where: Prisma.ImageWhereInput = {
      deleted_at: null,
      ...params.where,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.image.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
        include: { category: true },
      }),
      this.prisma.image.count({ where }),
    ]);
    return { items, total };
  }
}
