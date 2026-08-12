import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { makeSlug } from '../../common/utils/slug';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsRepository } from './tags.repository';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async create(dto: CreateTagDto) {
    try {
      const tag = await this.tagsRepository.create({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      });
      return toCamel(tag);
    } catch (error) {
      handlePrismaError(error, 'Tag slug already exists');
    }
  }

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.TagWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy = parseSort(query.sort, ['name', 'created_at'], {
      field: 'name',
      direction: 'asc',
    });
    const { items, total } = await this.tagsRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async findBySlug(slug: string) {
    const tag = await this.tagsRepository.findBySlug(slug);
    if (!tag) {
      throw new NotFoundException({
        message: 'Tag not found',
        error: { code: 'TAG_NOT_FOUND', details: null },
      });
    }
    return toCamel(tag);
  }

  async update(id: number, dto: UpdateTagDto) {
    const existing = await this.tagsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Tag not found',
        error: { code: 'TAG_NOT_FOUND', details: null },
      });
    }
    try {
      const tag = await this.tagsRepository.update(id, {
        name: dto.name,
        slug: dto.slug,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      });
      return toCamel(tag);
    } catch (error) {
      handlePrismaError(error, 'Tag slug already exists');
    }
  }

  async remove(id: number) {
    const existing = await this.tagsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Tag not found',
        error: { code: 'TAG_NOT_FOUND', details: null },
      });
    }
    await this.tagsRepository.softDelete(id);
    return null;
  }
}
