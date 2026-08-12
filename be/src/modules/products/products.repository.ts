import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const listInclude = {
  brand: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  variants: {
    where: { deleted_at: null },
    select: {
      id: true,
      price: true,
      sale_price: true,
      status: true,
    },
    orderBy: { price: 'asc' as const },
  },
} satisfies Prisma.ProductInclude;

const detailInclude = {
  brand: { select: { id: true, name: true, slug: true, logo: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: {
    where: { deleted_at: null },
    orderBy: { sort_order: 'asc' as const },
  },
  variants: {
    where: { deleted_at: null },
    orderBy: { created_at: 'asc' as const },
    include: {
      variant_attributes: {
        where: { deleted_at: null },
        include: {
          attribute_value: {
            include: {
              attribute: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      },
    },
  },
  product_tags: {
    where: { deleted_at: null },
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  get client() {
    return this.prisma;
  }

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data, include: detailInclude });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: { slug, deleted_at: null },
      include: detailInclude,
    });
  }

  findById(id: number) {
    return this.prisma.product.findFirst({
      where: { id, deleted_at: null },
      include: detailInclude,
    });
  }

  update(id: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: detailInclude,
    });
  }

  softDelete(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip: params.skip,
        take: params.take,
        where,
        orderBy: params.orderBy,
        include: listInclude,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  // variants
  createVariant(data: Prisma.ProductVariantCreateInput) {
    return this.prisma.productVariant.create({
      data,
      include: {
        variant_attributes: {
          where: { deleted_at: null },
          include: {
            attribute_value: {
              include: {
                attribute: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  findVariantById(id: number) {
    return this.prisma.productVariant.findFirst({
      where: { id, deleted_at: null },
      include: {
        variant_attributes: {
          where: { deleted_at: null },
          include: {
            attribute_value: {
              include: {
                attribute: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  updateVariant(id: number, data: Prisma.ProductVariantUpdateInput) {
    return this.prisma.productVariant.update({
      where: { id },
      data,
      include: {
        variant_attributes: {
          where: { deleted_at: null },
          include: {
            attribute_value: {
              include: {
                attribute: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  softDeleteVariant(id: number) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  listVariants(productId: number) {
    return this.prisma.productVariant.findMany({
      where: { product_id: productId, deleted_at: null },
      orderBy: { created_at: 'asc' },
      include: {
        variant_attributes: {
          where: { deleted_at: null },
          include: {
            attribute_value: {
              include: {
                attribute: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  replaceVariantAttributes(variantId: number, attributeValueIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.variantAttribute.updateMany({
        where: { variant_id: variantId, deleted_at: null },
        data: { deleted_at: new Date() },
      });
      if (attributeValueIds.length) {
        await tx.variantAttribute.createMany({
          data: attributeValueIds.map((attribute_value_id) => ({
            variant_id: variantId,
            attribute_value_id,
          })),
          skipDuplicates: true,
        });
      }
      return tx.productVariant.findFirst({
        where: { id: variantId, deleted_at: null },
        include: {
          variant_attributes: {
            where: { deleted_at: null },
            include: {
              attribute_value: {
                include: {
                  attribute: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      });
    });
  }

  // images
  createImage(data: Prisma.ProductImageCreateInput) {
    return this.prisma.productImage.create({ data });
  }

  findImageById(id: number) {
    return this.prisma.productImage.findFirst({
      where: { id, deleted_at: null },
    });
  }

  updateImage(id: number, data: Prisma.ProductImageUpdateInput) {
    return this.prisma.productImage.update({ where: { id }, data });
  }

  softDeleteImage(id: number) {
    return this.prisma.productImage.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  reorderImages(productId: number, imageIds: number[]) {
    return this.prisma.$transaction(
      imageIds.map((id, index) =>
        this.prisma.productImage.updateMany({
          where: { id, product_id: productId, deleted_at: null },
          data: { sort_order: index },
        }),
      ),
    );
  }

  // attributes
  createAttribute(data: Prisma.ProductAttributeCreateInput) {
    return this.prisma.productAttribute.create({ data });
  }

  createAttributeValue(data: Prisma.ProductAttributeValueCreateInput) {
    return this.prisma.productAttributeValue.create({ data });
  }

  listAttributes() {
    return this.prisma.productAttribute.findMany({
      where: { deleted_at: null },
      orderBy: { sort_order: 'asc' },
      include: {
        values: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
      },
    });
  }

  replaceTags(productId: number, tagIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.productTag.updateMany({
        where: { product_id: productId, deleted_at: null },
        data: { deleted_at: new Date() },
      });
      if (tagIds.length) {
        await tx.productTag.createMany({
          data: tagIds.map((tag_id) => ({ product_id: productId, tag_id })),
          skipDuplicates: true,
        });
      }
    });
  }
}
