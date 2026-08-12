import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import {
  extractIdFromSlug,
  isLegacySeoSlug,
  makeSlug,
  stripIdSuffix,
  withIdSuffix,
} from '../../common/utils/slug';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  private mapPost(post: {
    post_tags?: Array<{ tag: unknown }>;
    [key: string]: unknown;
  }) {
    const { post_tags, ...rest } = post;
    return {
      ...rest,
      tags: post_tags?.map((pt) => pt.tag),
    };
  }

  private resolveBaseSlug(title: string, slug?: string) {
    const raw = (slug?.trim() || title).trim();
    return makeSlug(stripIdSuffix(raw)) || makeSlug(title) || 'post';
  }

  async create(authorId: number, dto: CreatePostDto) {
    try {
      const status = dto.status ?? PostStatus.DRAFT;
      const baseSlug = this.resolveBaseSlug(dto.title, dto.slug);
      // Temp unique slug until we know the generated id.
      const tempSlug = `${baseSlug}-${Date.now().toString(36)}`;
      const created = await this.postsRepository.create({
        title: dto.title,
        content: dto.content,
        slug: tempSlug,
        summary: dto.summary,
        thumbnail: dto.thumbnail,
        status,
        published_at: status === PostStatus.PUBLISHED ? new Date() : null,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        author: { connect: { id: authorId } },
        category: { connect: { id: dto.categoryId } },
        ...(dto.tagIds?.length
          ? {
              post_tags: {
                create: dto.tagIds.map((tag_id) => ({
                  tag: { connect: { id: tag_id } },
                })),
              },
            }
          : {}),
      });
      const post = await this.postsRepository.update(created.id, {
        slug: withIdSuffix(baseSlug, created.id),
      });
      return toCamel(this.mapPost(post));
    } catch (error) {
      handlePrismaError(error, 'Post slug already exists');
    }
  }

  async findAll(query: QueryPostDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PostWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.categorySlug
        ? { category: { slug: query.categorySlug, deleted_at: null } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy = parseSort(
      query.sort,
      ['published_at', 'created_at', 'views', 'title'],
      { field: 'published_at', direction: 'desc' },
    );
    const { items, total } = await this.postsRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({
      items: items.map((item) => this.mapPost(item)),
      meta: buildMeta(page, limit, total),
    });
  }

  async findBySlug(slug: string) {
    let post = await this.postsRepository.findBySlug(slug);
    if (!post) {
      const id = extractIdFromSlug(slug);
      if (id) {
        post = await this.postsRepository.findById(id);
      }
    }
    if (!post) {
      throw new NotFoundException({
        message: 'Post not found',
        error: { code: 'POST_NOT_FOUND', details: null },
      });
    }
    await this.postsRepository.incrementViews(post.id);
    return toCamel(this.mapPost({ ...post, views: post.views + 1 }));
  }

  /** Staff edit form — no view increment. */
  async findByIdForEdit(id: number) {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException({
        message: 'Post not found',
        error: { code: 'POST_NOT_FOUND', details: null },
      });
    }
    return toCamel(this.mapPost(post));
  }

  async update(id: number, dto: UpdatePostDto) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Post not found',
        error: { code: 'POST_NOT_FOUND', details: null },
      });
    }
    try {
      if (dto.tagIds) {
        await this.postsRepository.replaceTags(id, dto.tagIds);
      }
      const becomingPublished =
        dto.status === PostStatus.PUBLISHED &&
        existing.status !== PostStatus.PUBLISHED;
      // Preserve imported SEO slugs (no `-{intId}`). Only rewrite when client sends slug.
      let nextSlug: string | undefined;
      if (dto.slug !== undefined) {
        const base = this.resolveBaseSlug(dto.title ?? existing.title, dto.slug);
        nextSlug = isLegacySeoSlug(existing.slug, id)
          ? base || existing.slug
          : withIdSuffix(base, id);
      }
      const post = await this.postsRepository.update(id, {
        title: dto.title,
        content: dto.content,
        slug: nextSlug,
        summary: dto.summary,
        thumbnail: dto.thumbnail,
        status: dto.status,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        ...(dto.categoryId
          ? { category: { connect: { id: dto.categoryId } } }
          : {}),
        ...(becomingPublished
          ? { published_at: existing.published_at ?? new Date() }
          : {}),
      });
      return toCamel(this.mapPost(post));
    } catch (error) {
      handlePrismaError(error, 'Post slug already exists');
    }
  }

  async remove(id: number) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Post not found',
        error: { code: 'POST_NOT_FOUND', details: null },
      });
    }
    await this.postsRepository.softDelete(id);
    return null;
  }

  async createCategory(dto: CreatePostCategoryDto) {
    try {
      const category = await this.postsRepository.createCategory({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        description: dto.description,
        sort_order: dto.sortOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        ...(dto.parentId
          ? { parent: { connect: { id: dto.parentId } } }
          : {}),
      });
      return toCamel(category);
    } catch (error) {
      handlePrismaError(error, 'Post category slug already exists');
    }
  }

  async findCategories(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const orderBy = parseSort(
      query.sort,
      ['sort_order', 'name', 'created_at'],
      { field: 'sort_order', direction: 'asc' },
    );
    const { items, total } = await this.postsRepository.findCategories({
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async updateCategory(id: number, dto: CreatePostCategoryDto) {
    const existing = await this.postsRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Post category not found',
        error: { code: 'POST_CATEGORY_NOT_FOUND', details: null },
      });
    }
    try {
      const category = await this.postsRepository.updateCategory(id, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        sort_order: dto.sortOrder,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        ...(dto.parentId !== undefined
          ? dto.parentId
            ? { parent: { connect: { id: dto.parentId } } }
            : { parent: { disconnect: true } }
          : {}),
      });
      return toCamel(category);
    } catch (error) {
      handlePrismaError(error, 'Post category slug already exists');
    }
  }

  async removeCategory(id: number) {
    const existing = await this.postsRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Post category not found',
        error: { code: 'POST_CATEGORY_NOT_FOUND', details: null },
      });
    }
    await this.postsRepository.softDeleteCategory(id);
    return null;
  }

  async exists(id: number) {
    const post = await this.postsRepository.findById(id);
    return !!post;
  }
}
