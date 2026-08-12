import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { makeSlug } from '../../common/utils/slug';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type CategoryNode = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  children: CategoryNode[];
  [key: string]: unknown;
};

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.categoriesRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException({
          message: 'Parent category not found',
          error: { code: 'PARENT_NOT_FOUND', details: null },
        });
      }
    }
    try {
      const category = await this.categoriesRepository.create({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        description: dto.description,
        image: dto.image,
        sort_order: dto.sortOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        ...(dto.parentId
          ? { parent: { connect: { id: dto.parentId } } }
          : {}),
      });
      return toCamel(category);
    } catch (error) {
      handlePrismaError(error, 'Category slug already exists');
    }
  }

  async findAll(query: QueryCategoryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CategoryWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy = parseSort(
      query.sort,
      ['sort_order', 'name', 'created_at'],
      { field: 'sort_order', direction: 'asc' },
    );
    const { items, total } = await this.categoriesRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async tree() {
    const all = await this.categoriesRepository.findAllActive({
      sort_order: 'asc',
    });
    const map = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];
    for (const item of all) {
      map.set(item.id, { ...item, children: [] });
    }
    for (const node of map.values()) {
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return toCamel(roots);
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        error: { code: 'CATEGORY_NOT_FOUND', details: null },
      });
    }
    return toCamel(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Category not found',
        error: { code: 'CATEGORY_NOT_FOUND', details: null },
      });
    }
    try {
      const category = await this.categoriesRepository.update(id, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image: dto.image,
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
      handlePrismaError(error, 'Category slug already exists');
    }
  }

  async remove(id: number) {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Category not found',
        error: { code: 'CATEGORY_NOT_FOUND', details: null },
      });
    }
    await this.categoriesRepository.softDelete(id);
    return null;
  }
}
