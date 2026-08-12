import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
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
import {
  CreateAttributeDto,
  CreateAttributeValueDto,
} from './dto/create-attribute.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private mapListItem(product: {
    variants?: Array<{
      price: { toString(): string };
      sale_price: { toString(): string } | null;
    }>;
    product_tags?: Array<{ tag: unknown }>;
    [key: string]: unknown;
  }) {
    const variants = product.variants ?? [];
    const lowest = variants[0];
    const { variants: _v, product_tags, ...rest } = product;
    return {
      ...rest,
      price_from: lowest ? lowest.price.toString() : null,
      sale_price_from: lowest?.sale_price
        ? lowest.sale_price.toString()
        : null,
      tags: product_tags?.map((pt) => pt.tag),
    };
  }

  private resolveBaseSlug(name: string, slug?: string) {
    const raw = (slug?.trim() || name).trim();
    return makeSlug(stripIdSuffix(raw)) || makeSlug(name) || 'product';
  }

  private decimalString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' || typeof value === 'string') {
      return String(value);
    }
    if (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as { toString?: unknown }).toString === 'function'
    ) {
      return (value as { toString: () => string }).toString();
    }
    return null;
  }

  private mapVariant(variant: {
    variant_attributes?: Array<{
      attribute_value: {
        id: number;
        value: string;
        attribute: unknown;
      };
    }>;
    price?: unknown;
    sale_price?: unknown;
    weight?: unknown;
    [key: string]: unknown;
  }) {
    const variant_attributes = variant.variant_attributes ?? [];
    const { variant_attributes: _va, price, sale_price, weight, ...rest } =
      variant;
    return {
      ...rest,
      price: this.decimalString(price) ?? '0',
      sale_price: this.decimalString(sale_price),
      weight: this.decimalString(weight),
      attribute_value_ids: variant_attributes.map((va) => va.attribute_value.id),
      attributes: variant_attributes.map((va) => ({
        id: va.attribute_value.id,
        value: va.attribute_value.value,
        attribute: va.attribute_value.attribute,
      })),
    };
  }

  private mapDetail(product: {
    variants?: Array<{
      variant_attributes?: Array<{
        attribute_value: {
          id: number;
          value: string;
          attribute: unknown;
        };
      }>;
      [key: string]: unknown;
    }>;
    product_tags?: Array<{ tag: unknown }>;
    [key: string]: unknown;
  }) {
    const attributeMap = new Map<number, unknown>();
    for (const variant of product.variants ?? []) {
      for (const va of variant.variant_attributes ?? []) {
        attributeMap.set(va.attribute_value.id, {
          id: va.attribute_value.id,
          value: va.attribute_value.value,
          attribute: va.attribute_value.attribute,
        });
      }
    }
    const variants = (product.variants ?? []).map((v) => this.mapVariant(v));
    const { product_tags, ...rest } = product;
    return {
      ...rest,
      variants,
      attributes: Array.from(attributeMap.values()),
      tags: product_tags?.map((pt) => pt.tag),
    };
  }

  async create(dto: CreateProductDto) {
    try {
      const baseSlug = this.resolveBaseSlug(dto.name, dto.slug);
      const tempSlug = `${baseSlug}-${Date.now().toString(36)}`;
      const created = await this.productsRepository.create({
        name: dto.name,
        sku: dto.sku,
        slug: tempSlug,
        short_description: dto.shortDescription,
        description: dto.description,
        thumbnail: dto.thumbnail,
        published: dto.published ?? false,
        featured: dto.featured ?? false,
        status: dto.status ?? ProductStatus.DRAFT,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        brand: { connect: { id: dto.brandId } },
        category: { connect: { id: dto.categoryId } },
        ...(dto.tagIds?.length
          ? {
              product_tags: {
                create: dto.tagIds.map((tag_id) => ({
                  tag: { connect: { id: tag_id } },
                })),
              },
            }
          : {}),
      });
      const product = await this.productsRepository.update(created.id, {
        slug: withIdSuffix(baseSlug, created.id),
      });
      return toCamel(this.mapDetail(product));
    } catch (error) {
      handlePrismaError(error, 'Product slug or SKU already exists');
    }
  }

  async findAll(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductWhereInput = {
      ...(query.includeDeleted ? {} : { deleted_at: null }),
      ...(query.featured !== undefined ? { featured: query.featured } : {}),
      ...(query.published !== undefined ? { published: query.published } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.brandSlug
        ? { brand: { slug: query.brandSlug, deleted_at: null } }
        : {}),
      ...(query.categorySlug
        ? { category: { slug: query.categorySlug, deleted_at: null } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = parseSort(
      query.sort,
      ['created_at', 'updated_at', 'name', 'featured'],
      { field: 'created_at', direction: 'desc' },
    );

    const { items, total } = await this.productsRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });

    return toCamel({
      items: items.map((item) => this.mapListItem(item)),
      meta: buildMeta(page, limit, total),
    });
  }

  async findBySlug(slug: string) {
    let product = await this.productsRepository.findBySlug(slug);
    if (!product) {
      const id = extractIdFromSlug(slug);
      if (id) {
        product = await this.productsRepository.findById(id);
      }
    }
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    return toCamel(this.mapDetail(product));
  }

  /** Staff edit form — load by numeric id. */
  async findByIdForEdit(id: number) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    return toCamel(this.mapDetail(product));
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.productsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    try {
      if (dto.tagIds) {
        await this.productsRepository.replaceTags(id, dto.tagIds);
      }
      let nextSlug: string | undefined;
      if (dto.slug !== undefined) {
        const base = this.resolveBaseSlug(dto.name ?? existing.name, dto.slug);
        // Imported products keep `{base}-{mongoObjectId}` when already legacy SEO.
        nextSlug = isLegacySeoSlug(existing.slug, id)
          ? dto.slug.trim() || existing.slug
          : withIdSuffix(base, id);
      }
      const product = await this.productsRepository.update(id, {
        name: dto.name,
        sku: dto.sku,
        slug: nextSlug,
        short_description: dto.shortDescription,
        description: dto.description,
        thumbnail: dto.thumbnail,
        published: dto.published,
        featured: dto.featured,
        status: dto.status,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
        ...(dto.categoryId
          ? { category: { connect: { id: dto.categoryId } } }
          : {}),
      });
      return toCamel(this.mapDetail(product));
    } catch (error) {
      handlePrismaError(error, 'Product slug or SKU already exists');
    }
  }

  async remove(id: number) {
    const existing = await this.productsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    await this.productsRepository.softDelete(id);
    return null;
  }

  async listVariants(productId: number) {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    const items = await this.productsRepository.listVariants(productId);
    return toCamel({ items: items.map((item) => this.mapVariant(item)) });
  }

  async createVariant(productId: number, dto: CreateVariantDto) {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    try {
      const created = await this.productsRepository.createVariant({
        sku: dto.sku,
        barcode: dto.barcode,
        name: dto.name,
        price: dto.price,
        sale_price: dto.salePrice,
        stock: dto.stock ?? 0,
        weight: dto.weight,
        image: dto.image,
        status: dto.status,
        product: { connect: { id: productId } },
      });
      const variant =
        dto.attributeValueIds !== undefined
          ? await this.productsRepository.replaceVariantAttributes(
              created.id,
              dto.attributeValueIds,
            )
          : created;
      return toCamel(this.mapVariant(variant ?? created));
    } catch (error) {
      handlePrismaError(error, 'Variant SKU already exists');
    }
  }

  async updateVariant(variantId: number, dto: UpdateVariantDto) {
    const existing = await this.productsRepository.findVariantById(variantId);
    if (!existing) {
      throw new NotFoundException({
        message: 'Variant not found',
        error: { code: 'VARIANT_NOT_FOUND', details: null },
      });
    }
    try {
      await this.productsRepository.updateVariant(variantId, {
        sku: dto.sku,
        barcode: dto.barcode,
        name: dto.name,
        price: dto.price,
        sale_price: dto.salePrice,
        stock: dto.stock,
        weight: dto.weight,
        image: dto.image,
        status: dto.status,
      });
      const variant =
        dto.attributeValueIds !== undefined
          ? await this.productsRepository.replaceVariantAttributes(
              variantId,
              dto.attributeValueIds,
            )
          : await this.productsRepository.findVariantById(variantId);
      if (!variant) {
        throw new NotFoundException({
          message: 'Variant not found',
          error: { code: 'VARIANT_NOT_FOUND', details: null },
        });
      }
      return toCamel(this.mapVariant(variant));
    } catch (error) {
      handlePrismaError(error, 'Variant SKU already exists');
    }
  }

  async removeVariant(variantId: number) {
    const existing = await this.productsRepository.findVariantById(variantId);
    if (!existing) {
      throw new NotFoundException({
        message: 'Variant not found',
        error: { code: 'VARIANT_NOT_FOUND', details: null },
      });
    }
    await this.productsRepository.softDeleteVariant(variantId);
    return null;
  }

  async addImage(productId: number, dto: CreateProductImageDto) {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    const image = await this.productsRepository.createImage({
      image_url: dto.imageUrl,
      alt_text: dto.altText,
      sort_order: dto.sortOrder ?? 0,
      product: { connect: { id: productId } },
    });
    return toCamel(image);
  }

  async updateImage(
    imageId: number,
    dto: { imageUrl?: string; altText?: string; sortOrder?: number },
  ) {
    const existing = await this.productsRepository.findImageById(imageId);
    if (!existing) {
      throw new NotFoundException({
        message: 'Product image not found',
        error: { code: 'PRODUCT_IMAGE_NOT_FOUND', details: null },
      });
    }
    const image = await this.productsRepository.updateImage(imageId, {
      image_url: dto.imageUrl,
      alt_text: dto.altText,
      sort_order: dto.sortOrder,
    });
    return toCamel(image);
  }

  async reorderImages(productId: number, imageIds: number[]) {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        error: { code: 'PRODUCT_NOT_FOUND', details: null },
      });
    }
    await this.productsRepository.reorderImages(productId, imageIds);
    return this.findByIdForEdit(productId);
  }

  async removeImage(imageId: number) {
    const existing = await this.productsRepository.findImageById(imageId);
    if (!existing) {
      throw new NotFoundException({
        message: 'Product image not found',
        error: { code: 'PRODUCT_IMAGE_NOT_FOUND', details: null },
      });
    }
    await this.productsRepository.softDeleteImage(imageId);
    return null;
  }

  async listAttributes() {
    const items = await this.productsRepository.listAttributes();
    return toCamel({ items });
  }

  async createAttribute(dto: CreateAttributeDto) {
    try {
      const attr = await this.productsRepository.createAttribute({
        name: dto.name,
        slug: dto.slug || makeSlug(dto.name),
        sort_order: dto.sortOrder ?? 0,
      });
      return toCamel(attr);
    } catch (error) {
      handlePrismaError(error, 'Attribute slug already exists');
    }
  }

  async createAttributeValue(attributeId: number, dto: CreateAttributeValueDto) {
    try {
      const value = await this.productsRepository.createAttributeValue({
        value: dto.value,
        slug: dto.slug || makeSlug(dto.value),
        sort_order: dto.sortOrder ?? 0,
        attribute: { connect: { id: attributeId } },
      });
      return toCamel(value);
    } catch (error) {
      handlePrismaError(error, 'Attribute value already exists');
    }
  }

  async exists(id: number) {
    const product = await this.productsRepository.findById(id);
    return !!product;
  }
}
