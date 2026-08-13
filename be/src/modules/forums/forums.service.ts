import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ThreadStatus, UserRole } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import {
  extractIdFromSlug,
  makeSlug,
  stripIdSuffix,
  withIdSuffix,
} from '../../common/utils/slug';
import {
  CreateForumCategoryDto,
  CreateForumDto,
  CreateForumPostDto,
  CreateThreadDto,
  QueryForumCategoryDto,
  QueryThreadDto,
  UpdateForumCategoryDto,
  UpdateForumDto,
  UpdateForumPostDto,
  UpdateThreadDto,
} from './dto/forum.dto';
import { ForumsRepository } from './forums.repository';

@Injectable()
export class ForumsService {
  constructor(private readonly forumsRepository: ForumsRepository) {}

  // ---- Forum categories ----
  async createCategory(dto: CreateForumCategoryDto) {
    try {
      const item = await this.forumsRepository.createCategory({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        description: dto.description,
        sort_order: dto.sortOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      });
      return toCamel(item);
    } catch (error) {
      handlePrismaError(error, 'Forum category slug already exists');
    }
  }

  async findCategories(query: QueryForumCategoryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const orderBy = parseSort(
      query.sort,
      ['sort_order', 'name', 'created_at'],
      { field: 'sort_order', direction: 'asc' },
    );
    const { items, total } = await this.forumsRepository.findCategories({
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      includeForums: query.includeForums ?? false,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async updateCategory(id: number, dto: UpdateForumCategoryDto) {
    const existing = await this.forumsRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Forum category not found',
        error: { code: 'FORUM_CATEGORY_NOT_FOUND', details: null },
      });
    }
    try {
      const item = await this.forumsRepository.updateCategory(id, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        sort_order: dto.sortOrder,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      });
      return toCamel(item);
    } catch (error) {
      handlePrismaError(error, 'Forum category slug already exists');
    }
  }

  async removeCategory(id: number) {
    const existing = await this.forumsRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Forum category not found',
        error: { code: 'FORUM_CATEGORY_NOT_FOUND', details: null },
      });
    }
    await this.forumsRepository.softDeleteCategory(id);
    return null;
  }

  // ---- Forums ----
  async createForum(dto: CreateForumDto) {
    try {
      const item = await this.forumsRepository.createForum({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        description: dto.description,
        icon: dto.icon,
        sort_order: dto.sortOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        category: { connect: { id: dto.categoryId } },
      });
      return toCamel(item);
    } catch (error) {
      handlePrismaError(error, 'Forum slug already exists');
    }
  }

  async findForumBySlug(slug: string) {
    const forum = await this.forumsRepository.findForumBySlug(slug);
    if (!forum) {
      throw new NotFoundException({
        message: 'Forum not found',
        error: { code: 'FORUM_NOT_FOUND', details: null },
      });
    }
    return toCamel(forum);
  }

  async updateForum(id: number, dto: UpdateForumDto) {
    const existing = await this.forumsRepository.findForumById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Forum not found',
        error: { code: 'FORUM_NOT_FOUND', details: null },
      });
    }
    try {
      const item = await this.forumsRepository.updateForum(id, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        sort_order: dto.sortOrder,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        ...(dto.categoryId
          ? { category: { connect: { id: dto.categoryId } } }
          : {}),
      });
      return toCamel(item);
    } catch (error) {
      handlePrismaError(error, 'Forum slug already exists');
    }
  }

  async removeForum(id: number) {
    const existing = await this.forumsRepository.findForumById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Forum not found',
        error: { code: 'FORUM_NOT_FOUND', details: null },
      });
    }
    await this.forumsRepository.softDeleteForum(id);
    return null;
  }

  private resolveThreadBaseSlug(title: string, slug?: string) {
    const raw = (slug?.trim() || title).trim();
    return makeSlug(stripIdSuffix(raw)) || makeSlug(title) || 'thread';
  }

  // ---- Threads ----
  async createThread(userId: number, dto: CreateThreadDto) {
    const forum = await this.forumsRepository.findForumById(dto.forumId);
    if (!forum) {
      throw new NotFoundException({
        message: 'Forum not found',
        error: { code: 'FORUM_NOT_FOUND', details: null },
      });
    }
    const baseSlug = this.resolveThreadBaseSlug(dto.title, dto.slug);
    const tempSlug = `${baseSlug}-${Date.now().toString(36)}`;
    try {
      const thread = await this.forumsRepository.client.$transaction(
        async (tx) => {
          const created = await tx.thread.create({
            data: {
              title: dto.title,
              slug: tempSlug,
              content: dto.content,
              forum: { connect: { id: dto.forumId } },
              user: { connect: { id: userId } },
              ...(dto.tagIds?.length
                ? {
                    thread_tags: {
                      create: dto.tagIds.map((tag_id) => ({
                        tag: { connect: { id: tag_id } },
                      })),
                    },
                  }
                : {}),
            },
            include: {
              forum: { select: { id: true, name: true, slug: true } },
              user: { select: { id: true, username: true, full_name: true, avatar: true } },
            },
          });

          const withSlug = await tx.thread.update({
            where: { id: created.id },
            data: { slug: withIdSuffix(baseSlug, created.id) },
            include: {
              forum: { select: { id: true, name: true, slug: true } },
              user: { select: { id: true, username: true, full_name: true, avatar: true } },
            },
          });

          await tx.forum.update({
            where: { id: dto.forumId },
            data: {
              thread_count: { increment: 1 },
              last_thread_id: created.id,
            },
          });

          return withSlug;
        },
      );
      return toCamel(thread);
    } catch (error) {
      handlePrismaError(error, 'Thread slug already exists in this forum');
    }
  }

  async findThreads(query: QueryThreadDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ThreadWhereInput = {
      status: query.status
        ? query.status
        : { notIn: [ThreadStatus.HIDDEN, ThreadStatus.DELETED] },
      ...(query.forumId ? { forum_id: query.forumId } : {}),
      ...(query.forumSlug
        ? { forum: { slug: query.forumSlug, deleted_at: null } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { content: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    let orderBy:
      | Prisma.ThreadOrderByWithRelationInput
      | Prisma.ThreadOrderByWithRelationInput[] = [
      { is_pinned: 'desc' },
      { last_reply_at: 'desc' },
    ];
    if (query.sort) {
      orderBy = parseSort(
        query.sort,
        ['last_reply_at', 'created_at', 'views', 'reply_count', 'is_pinned'],
        { field: 'last_reply_at', direction: 'desc' },
      );
    }

    const { items, total } = await this.forumsRepository.findThreads({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  /** Admin/mod: includes HIDDEN; DELETED still excluded via deleted_at. */
  async findThreadsAdmin(query: QueryThreadDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ThreadWhereInput = {
      status: query.status
        ? query.status
        : { not: ThreadStatus.DELETED },
      ...(query.forumId ? { forum_id: query.forumId } : {}),
      ...(query.forumSlug
        ? { forum: { slug: query.forumSlug, deleted_at: null } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { content: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    let orderBy:
      | Prisma.ThreadOrderByWithRelationInput
      | Prisma.ThreadOrderByWithRelationInput[] = [
      { is_pinned: 'desc' },
      { last_reply_at: 'desc' },
    ];
    if (query.sort) {
      orderBy = parseSort(
        query.sort,
        ['last_reply_at', 'created_at', 'views', 'reply_count', 'is_pinned'],
        { field: 'last_reply_at', direction: 'desc' },
      );
    }
    const { items, total } = await this.forumsRepository.findThreads({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async findPostsAdmin(query: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    threadId?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const orderBy = parseSort(query.sort, ['created_at'], {
      field: 'created_at',
      direction: 'desc',
    });
    const { items, total } = await this.forumsRepository.findPostsAdmin({
      threadId: query.threadId,
      search: query.search,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async findThreadsByForumId(forumId: number, query: QueryThreadDto) {
    return this.findThreads({ ...query, forumId });
  }

  async findThreadBySlug(slug: string) {
    let thread = await this.forumsRepository.findThreadBySlug(slug);
    if (!thread) {
      const id = extractIdFromSlug(slug);
      if (id) {
        thread = await this.forumsRepository.findThreadById(id);
      }
    }
    if (!thread || thread.status === ThreadStatus.HIDDEN) {
      throw new NotFoundException({
        message: 'Thread not found',
        error: { code: 'THREAD_NOT_FOUND', details: null },
      });
    }
    await this.forumsRepository.incrementThreadViews(thread.id);
    const { thread_tags, ...rest } = thread;
    return toCamel({
      ...rest,
      views: thread.views + 1,
      tags: (thread_tags ?? []).map((tt) => tt.tag),
    });
  }

  async updateThread(
    id: number,
    dto: UpdateThreadDto,
    actor: { id: number; role: string },
  ) {
    const thread = await this.forumsRepository.findThreadById(id);
    if (!thread) {
      throw new NotFoundException({
        message: 'Thread not found',
        error: { code: 'THREAD_NOT_FOUND', details: null },
      });
    }
    const isMod =
      actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR;
    if (thread.user_id !== actor.id && !isMod) {
      throw new ForbiddenException({
        message: 'Not allowed to update this thread',
        error: { code: 'FORBIDDEN', details: null },
      });
    }
    if (
      (dto.isPinned !== undefined ||
        dto.isLocked !== undefined ||
        dto.status !== undefined) &&
      !isMod
    ) {
      throw new ForbiddenException({
        message: 'Only moderators can pin/lock/hide threads',
        error: { code: 'FORBIDDEN', details: null },
      });
    }
    const nextSlug =
      dto.title !== undefined
        ? withIdSuffix(this.resolveThreadBaseSlug(dto.title), id)
        : thread.slug.endsWith(`-${id}`)
          ? undefined
          : withIdSuffix(
              stripIdSuffix(thread.slug, id) || makeSlug(thread.title),
              id,
            );
    let nextStatus = dto.status;
    if (nextStatus === undefined) {
      if (dto.isLocked === true) nextStatus = ThreadStatus.CLOSED;
      if (dto.isLocked === false) nextStatus = ThreadStatus.OPEN;
    }
    const updated = await this.forumsRepository.updateThread(id, {
      title: dto.title,
      content: dto.content,
      slug: nextSlug,
      is_pinned: dto.isPinned,
      is_locked:
        dto.isLocked !== undefined
          ? dto.isLocked
          : nextStatus === ThreadStatus.CLOSED
            ? true
            : nextStatus === ThreadStatus.OPEN
              ? false
              : undefined,
      ...(nextStatus !== undefined ? { status: nextStatus } : {}),
    });
    return toCamel(updated);
  }

  async removeThread(id: number, actor: { id: number; role: string }) {
    const thread = await this.forumsRepository.findThreadById(id);
    if (!thread) {
      throw new NotFoundException({
        message: 'Thread not found',
        error: { code: 'THREAD_NOT_FOUND', details: null },
      });
    }
    const isMod =
      actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR;
    if (thread.user_id !== actor.id && !isMod) {
      throw new ForbiddenException({
        message: 'Not allowed to delete this thread',
        error: { code: 'FORBIDDEN', details: null },
      });
    }

    await this.forumsRepository.client.$transaction(async (tx) => {
      await tx.thread.update({
        where: { id },
        data: { deleted_at: new Date(), status: ThreadStatus.DELETED },
      });
      await tx.forum.update({
        where: { id: thread.forum_id },
        data: {
          thread_count: { decrement: 1 },
          ...(thread.forum.last_thread_id === id
            ? { last_thread_id: null }
            : {}),
        },
      });
    });
    return null;
  }

  // ---- Forum posts ----
  async createPost(threadId: number, userId: number, dto: CreateForumPostDto) {
    const thread = await this.forumsRepository.findThreadById(threadId);
    if (!thread) {
      throw new NotFoundException({
        message: 'Thread not found',
        error: { code: 'THREAD_NOT_FOUND', details: null },
      });
    }
    if (thread.is_locked || thread.status === ThreadStatus.CLOSED) {
      throw new BadRequestException({
        message: 'Thread is locked',
        error: { code: 'THREAD_LOCKED', details: null },
      });
    }

    try {
      const post = await this.forumsRepository.client.$transaction(
        async (tx) => {
          const created = await tx.forumPost.create({
            data: {
              content: dto.content,
              thread: { connect: { id: threadId } },
              user: { connect: { id: userId } },
              ...(dto.replyToPostId
                ? { reply_to_post: { connect: { id: dto.replyToPostId } } }
                : {}),
            },
            include: {
              user: { select: { id: true, username: true, full_name: true, avatar: true } },
            },
          });

          await tx.thread.update({
            where: { id: threadId },
            data: {
              reply_count: { increment: 1 },
              last_reply_at: created.created_at,
              last_reply_user_id: userId,
            },
          });

          await tx.forum.update({
            where: { id: thread.forum_id },
            data: {
              post_count: { increment: 1 },
              last_post_id: created.id,
            },
          });

          return created;
        },
      );
      return toCamel(post);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findPosts(
    threadId: number,
    query: { page?: number; limit?: number; sort?: string },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const orderBy = parseSort(query.sort, ['created_at'], {
      field: 'created_at',
      direction: 'asc',
    });
    const { items, total } = await this.forumsRepository.findPosts({
      threadId,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async updatePost(
    postId: number,
    dto: UpdateForumPostDto,
    actor: { id: number; role: string },
  ) {
    const post = await this.forumsRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException({
        message: 'Forum post not found',
        error: { code: 'FORUM_POST_NOT_FOUND', details: null },
      });
    }
    const isMod =
      actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR;
    if (post.user_id !== actor.id && !isMod) {
      throw new ForbiddenException({
        message: 'Not allowed to update this post',
        error: { code: 'FORBIDDEN', details: null },
      });
    }
    const updated = await this.forumsRepository.updatePost(postId, {
      content: dto.content,
      edited_at: new Date(),
    });
    return toCamel(updated);
  }

  async removePost(postId: number, actor: { id: number; role: string }) {
    const post = await this.forumsRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException({
        message: 'Forum post not found',
        error: { code: 'FORUM_POST_NOT_FOUND', details: null },
      });
    }
    const isMod =
      actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR;
    if (post.user_id !== actor.id && !isMod) {
      throw new ForbiddenException({
        message: 'Not allowed to delete this post',
        error: { code: 'FORBIDDEN', details: null },
      });
    }

    const thread = await this.forumsRepository.findThreadById(post.thread_id);
    if (!thread) return null;

    await this.forumsRepository.client.$transaction(async (tx) => {
      await tx.forumPost.update({
        where: { id: postId },
        data: { deleted_at: new Date() },
      });
      await tx.thread.update({
        where: { id: post.thread_id },
        data: { reply_count: { decrement: 1 } },
      });
      await tx.forum.update({
        where: { id: thread.forum_id },
        data: {
          post_count: { decrement: 1 },
          ...(thread.forum.last_post_id === postId
            ? { last_post_id: null }
            : {}),
        },
      });
    });
    return null;
  }

  async threadExists(id: number) {
    const thread = await this.forumsRepository.findThreadById(id);
    return !!thread;
  }

  async forumPostExists(id: number) {
    const post = await this.forumsRepository.findPostById(id);
    return !!post;
  }
}
