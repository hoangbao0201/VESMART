import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { makeSlug } from '../../common/utils/slug';
import { UploadsService } from '../uploads/uploads.service';
import { CreateImageCategoryDto } from './dto/create-image-category.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { QueryImageDto } from './dto/query-image.dto';
import { UpdateImageCategoryDto } from './dto/update-image-category.dto';
import { ImagesRepository } from './images.repository';

type CategoryNode = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  sort_order: number;
  children: CategoryNode[];
  [key: string]: unknown;
};

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly uploadsService: UploadsService,
  ) {}

  async ensureDefaultCategories() {
    let sanPham = await this.imagesRepository.findCategoryBySlug('san-pham');
    if (!sanPham) {
      sanPham = await this.imagesRepository.createCategory({
        name: 'Sản phẩm',
        slug: 'san-pham',
        sort_order: 0,
      });
    }
    let sanPhamChiaSe =
      await this.imagesRepository.findCategoryBySlug('san-pham-chia-se');
    if (!sanPhamChiaSe) {
      sanPhamChiaSe = await this.imagesRepository.createCategory({
        name: 'Chia sẻ',
        slug: 'san-pham-chia-se',
        sort_order: 0,
        parent: { connect: { id: sanPham.id } },
      });
    }

    let robot = await this.imagesRepository.findCategoryBySlug('robot-hut-bui');
    if (!robot) {
      robot = await this.imagesRepository.createCategory({
        name: 'Robot hút bụi',
        slug: 'robot-hut-bui',
        sort_order: 1,
      });
    }
    let robotChiaSe = await this.imagesRepository.findCategoryBySlug(
      'robot-hut-bui-chia-se',
    );
    if (!robotChiaSe) {
      robotChiaSe = await this.imagesRepository.createCategory({
        name: 'Chia sẻ',
        slug: 'robot-hut-bui-chia-se',
        sort_order: 0,
        parent: { connect: { id: robot.id } },
      });
    }

    return {
      productShareId: sanPhamChiaSe.id,
      postShareId: robotChiaSe.id,
    };
  }

  async createCategory(dto: CreateImageCategoryDto) {
    if (dto.parentId) {
      const parent = await this.imagesRepository.findCategoryById(dto.parentId);
      if (!parent) {
        throw new NotFoundException({
          message: 'Parent category not found',
          error: { code: 'PARENT_NOT_FOUND', details: null },
        });
      }
      if (parent.parent_id != null) {
        throw new BadRequestException({
          message: 'Image categories are limited to 2 levels',
          error: { code: 'MAX_DEPTH', details: null },
        });
      }
    }

    try {
      const category = await this.imagesRepository.createCategory({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        sort_order: dto.sortOrder ?? 0,
        ...(dto.parentId
          ? { parent: { connect: { id: dto.parentId } } }
          : {}),
      });
      return toCamel(category);
    } catch (error) {
      handlePrismaError(error, 'Image category slug already exists');
    }
  }

  async updateCategory(id: number, dto: UpdateImageCategoryDto) {
    const existing = await this.imagesRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Image category not found',
        error: { code: 'IMAGE_CATEGORY_NOT_FOUND', details: null },
      });
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException({
          message: 'Category cannot be its own parent',
          error: { code: 'INVALID_PARENT', details: null },
        });
      }
      if (dto.parentId != null) {
        const parent = await this.imagesRepository.findCategoryById(
          dto.parentId,
        );
        if (!parent) {
          throw new NotFoundException({
            message: 'Parent category not found',
            error: { code: 'PARENT_NOT_FOUND', details: null },
          });
        }
        if (parent.parent_id != null) {
          throw new BadRequestException({
            message: 'Image categories are limited to 2 levels',
            error: { code: 'MAX_DEPTH', details: null },
          });
        }
        const childCount = await this.imagesRepository.countChildCategories(id);
        if (childCount > 0) {
          throw new BadRequestException({
            message: 'Cannot nest a category that already has children',
            error: { code: 'HAS_CHILDREN', details: null },
          });
        }
      }
    }

    try {
      const category = await this.imagesRepository.updateCategory(id, {
        name: dto.name,
        slug: dto.slug,
        sort_order: dto.sortOrder,
        ...(dto.parentId === undefined
          ? {}
          : dto.parentId == null
            ? { parent: { disconnect: true } }
            : { parent: { connect: { id: dto.parentId } } }),
      });
      return toCamel(category);
    } catch (error) {
      handlePrismaError(error, 'Image category slug already exists');
    }
  }

  async removeCategory(id: number) {
    const existing = await this.imagesRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Image category not found',
        error: { code: 'IMAGE_CATEGORY_NOT_FOUND', details: null },
      });
    }
    const childCount = await this.imagesRepository.countChildCategories(id);
    if (childCount > 0) {
      throw new BadRequestException({
        message: 'Category still has child categories',
        error: { code: 'HAS_CHILDREN', details: null },
      });
    }
    const imageCount = await this.imagesRepository.countImagesInCategory(id);
    if (imageCount > 0) {
      throw new BadRequestException({
        message: 'Category still has images',
        error: { code: 'HAS_IMAGES', details: null },
      });
    }
    await this.imagesRepository.softDeleteCategory(id);
    return null;
  }

  async tree() {
    const all = await this.imagesRepository.findAllCategories();
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

  async findAll(query: QueryImageDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ImageWhereInput = {
      ...(query.categoryId ? { category_id: query.categoryId } : {}),
      ...(query.q
        ? {
            OR: [
              { description: { contains: query.q, mode: 'insensitive' } },
              { url: { contains: query.q, mode: 'insensitive' } },
              { source_url: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy = parseSort(query.sort, ['created_at', 'id'], {
      field: 'created_at',
      direction: 'desc',
    });
    const { items, total } = await this.imagesRepository.findImages({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async findOne(id: number) {
    const image = await this.imagesRepository.findImageById(id);
    if (!image) {
      throw new NotFoundException({
        message: 'Image not found',
        error: { code: 'IMAGE_NOT_FOUND', details: null },
      });
    }
    return toCamel(image);
  }

  async uploadImage(file: Express.Multer.File, dto: CreateImageDto) {
    const category = await this.imagesRepository.findCategoryById(
      dto.categoryId,
    );
    if (!category) {
      throw new NotFoundException({
        message: 'Image category not found',
        error: { code: 'IMAGE_CATEGORY_NOT_FOUND', details: null },
      });
    }
    if (category.parent_id == null) {
      throw new BadRequestException({
        message: 'Images must belong to a level-2 (child) category',
        error: { code: 'NEED_CHILD_CATEGORY', details: null },
      });
    }

    const uploaded = await this.uploadsService.upload(
      file,
      `media/${category.slug}`,
    );
    try {
      const image = await this.imagesRepository.createImage({
        url: uploaded.url,
        r2_key: uploaded.key,
        description: dto.description,
        mime: uploaded.mime,
        bytes: uploaded.bytes,
        width: uploaded.width,
        height: uploaded.height,
        category: { connect: { id: category.id } },
      });
      return toCamel(image);
    } catch (error) {
      handlePrismaError(error, 'Failed to create image');
    }
  }

  async removeImage(id: number) {
    const existing = await this.imagesRepository.findImageById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Image not found',
        error: { code: 'IMAGE_NOT_FOUND', details: null },
      });
    }
    await this.imagesRepository.softDeleteImage(id);
    return null;
  }
}
