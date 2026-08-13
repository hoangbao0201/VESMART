import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForumsRepository {
  constructor(private readonly prisma: PrismaService) {}

  get client() {
    return this.prisma;
  }

  // ForumCategory
  createCategory(data: Prisma.ForumCategoryCreateInput) {
    return this.prisma.forumCategory.create({ data });
  }

  updateCategory(id: number, data: Prisma.ForumCategoryUpdateInput) {
    return this.prisma.forumCategory.update({ where: { id }, data });
  }

  softDeleteCategory(id: number) {
    return this.prisma.forumCategory.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  findCategoryById(id: number) {
    return this.prisma.forumCategory.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async findCategories(params: {
    skip: number;
    take: number;
    orderBy?: Prisma.ForumCategoryOrderByWithRelationInput;
    includeForums?: boolean;
  }) {
    const where = { deleted_at: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.forumCategory.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy ?? { sort_order: 'asc' },
        include: params.includeForums
          ? {
              forums: {
                where: { deleted_at: null },
                orderBy: { sort_order: 'asc' },
                include: {
                  last_thread: {
                    select: { id: true, slug: true, title: true },
                  },
                },
              },
            }
          : undefined,
      }),
      this.prisma.forumCategory.count({ where }),
    ]);
    return { items, total };
  }

  // Forum
  createForum(data: Prisma.ForumCreateInput) {
    return this.prisma.forum.create({ data });
  }

  updateForum(id: number, data: Prisma.ForumUpdateInput) {
    return this.prisma.forum.update({ where: { id }, data });
  }

  softDeleteForum(id: number) {
    return this.prisma.forum.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  findForumBySlug(slug: string) {
    return this.prisma.forum.findFirst({
      where: { slug, deleted_at: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        last_thread: { select: { id: true, slug: true, title: true } },
      },
    });
  }

  findForumById(id: number) {
    return this.prisma.forum.findFirst({
      where: { id, deleted_at: null },
    });
  }

  // Thread
  findThreadBySlug(slug: string) {
    return this.prisma.thread.findFirst({
      where: { slug, deleted_at: null },
      include: {
        forum: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, username: true, avatar: true } },
        last_reply_user: {
          select: { id: true, username: true, avatar: true },
        },
        thread_tags: {
          where: { deleted_at: null },
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        posts: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
          take: 50,
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });
  }

  findThreadById(id: number) {
    return this.prisma.thread.findFirst({
      where: { id, deleted_at: null },
      include: {
        forum: true,
        user: { select: { id: true, username: true, avatar: true } },
        last_reply_user: {
          select: { id: true, username: true, avatar: true },
        },
        thread_tags: {
          where: { deleted_at: null },
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        posts: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
          take: 50,
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });
  }

  async findThreads(params: {
    skip: number;
    take: number;
    where?: Prisma.ThreadWhereInput;
    orderBy?:
      | Prisma.ThreadOrderByWithRelationInput
      | Prisma.ThreadOrderByWithRelationInput[];
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.thread.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
        include: {
          forum: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, username: true, avatar: true } },
          last_reply_user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      }),
      this.prisma.thread.count({ where }),
    ]);
    return { items, total };
  }

  updateThread(id: number, data: Prisma.ThreadUpdateInput) {
    return this.prisma.thread.update({ where: { id }, data });
  }

  softDeleteThread(id: number) {
    return this.prisma.thread.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  incrementThreadViews(id: number) {
    return this.prisma.thread.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  // ForumPost
  findPostById(id: number) {
    return this.prisma.forumPost.findFirst({
      where: { id, deleted_at: null },
    });
  }

  updatePost(id: number, data: Prisma.ForumPostUpdateInput) {
    return this.prisma.forumPost.update({ where: { id }, data });
  }

  softDeletePost(id: number) {
    return this.prisma.forumPost.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findPosts(params: {
    threadId: number;
    skip: number;
    take: number;
    orderBy?: Prisma.ForumPostOrderByWithRelationInput;
  }) {
    const where = { thread_id: params.threadId, deleted_at: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.forumPost.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy ?? { created_at: 'asc' },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      this.prisma.forumPost.count({ where }),
    ]);
    return { items, total };
  }

  async findPostsAdmin(params: {
    threadId?: number;
    search?: string;
    skip: number;
    take: number;
    orderBy?: Prisma.ForumPostOrderByWithRelationInput;
  }) {
    const where: Prisma.ForumPostWhereInput = {
      deleted_at: null,
      ...(params.threadId ? { thread_id: params.threadId } : {}),
      ...(params.search
        ? { content: { contains: params.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.forumPost.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy ?? { created_at: 'desc' },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          thread: { select: { id: true, slug: true, title: true } },
        },
      }),
      this.prisma.forumPost.count({ where }),
    ]);
    return { items, total };
  }
}
