import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { makeSlug } from '../../common/utils/slug';
import { BrandsRepository } from './brands.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async create(dto: CreateBrandDto) {
    try {
      const brand = await this.brandsRepository.create({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        description: dto.description,
        logo: dto.logo,
        website: dto.website,
        sort_order: dto.sortOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      });
      return toCamel(brand);
    } catch (error) {
      handlePrismaError(error, 'Brand slug already exists');
    }
  }

  async findAll(query: QueryBrandDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BrandWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy = parseSort(query.sort, ['sort_order', 'name', 'created_at'], {
      field: 'sort_order',
      direction: 'asc',
    });
    const { items, total } = await this.brandsRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async findBySlug(slug: string) {
    const brand = await this.brandsRepository.findBySlug(slug);
    if (!brand) {
      throw new NotFoundException({
        message: 'Brand not found',
        error: { code: 'BRAND_NOT_FOUND', details: null },
      });
    }
    return toCamel(brand);
  }

  async update(id: number, dto: UpdateBrandDto) {
    const existing = await this.brandsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Brand not found',
        error: { code: 'BRAND_NOT_FOUND', details: null },
      });
    }
    try {
      const brand = await this.brandsRepository.update(id, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        logo: dto.logo,
        website: dto.website,
        sort_order: dto.sortOrder,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      });
      return toCamel(brand);
    } catch (error) {
      handlePrismaError(error, 'Brand slug already exists');
    }
  }

  async remove(id: number) {
    const existing = await this.brandsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Brand not found',
        error: { code: 'BRAND_NOT_FOUND', details: null },
      });
    }
    await this.brandsRepository.softDelete(id);
    return null;
  }
}
