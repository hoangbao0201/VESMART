import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const listInclude = {
  author: { select: { id: true, username: true, avatar: true } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.PostInclude;

const detailInclude = {
  ...listInclude,
  post_tags: {
    where: { deleted_at: null },
    include: { tag: { select: { id: true, name: true, slug: true } } },
  },
} satisfies Prisma.PostInclude;

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PostCreateInput) {
    return this.prisma.post.create({ data, include: detailInclude });
  }

  findBySlug(slug: string) {
    return this.prisma.post.findFirst({
      where: { slug, deleted_at: null },
      include: detailInclude,
    });
  }

  findById(id: number) {
    return this.prisma.post.findFirst({
      where: { id, deleted_at: null },
      include: detailInclude,
    });
  }

  update(id: number, data: Prisma.PostUpdateInput) {
    return this.prisma.post.update({
      where: { id },
      data,
      include: detailInclude,
    });
  }

  softDelete(id: number) {
    return this.prisma.post.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  incrementViews(id: number) {
    return this.prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
        include: listInclude,
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items, total };
  }

  // post categories
  createCategory(data: Prisma.PostCategoryCreateInput) {
    return this.prisma.postCategory.create({ data });
  }

  findCategoryById(id: number) {
    return this.prisma.postCategory.findFirst({
      where: { id, deleted_at: null },
    });
  }

  updateCategory(id: number, data: Prisma.PostCategoryUpdateInput) {
    return this.prisma.postCategory.update({ where: { id }, data });
  }

  softDeleteCategory(id: number) {
    return this.prisma.postCategory.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findCategories(params: {
    skip: number;
    take: number;
    where?: Prisma.PostCategoryWhereInput;
    orderBy?: Prisma.PostCategoryOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.postCategory.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
      }),
      this.prisma.postCategory.count({ where }),
    ]);
    return { items, total };
  }

  replaceTags(postId: number, tagIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.postTag.updateMany({
        where: { post_id: postId, deleted_at: null },
        data: { deleted_at: new Date() },
      });
      if (tagIds.length) {
        await tx.postTag.createMany({
          data: tagIds.map((tag_id) => ({ post_id: postId, tag_id })),
          skipDuplicates: true,
        });
      }
    });
  }
}
