import type { TagSummary } from "@/types/tag";

export type BrandSummary = {
  id: number;
  name: string;
  slug: string;
};

export type CategorySummary = {
  id: number;
  name: string;
  slug: string;
};

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type VariantStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export type ProductListItem = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string | null;
  thumbnail: string | null;
  featured: boolean;
  published?: boolean;
  status?: ProductStatus;
  brand?: BrandSummary | null;
  category?: CategorySummary | null;
  /** Lowest active variant price (Decimal serialized as string). */
  priceFrom?: string | null;
  salePriceFrom?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type ProductAttributeRef = {
  id: number;
  value: string;
  attribute?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type ProductVariant = {
  id: number;
  sku: string;
  barcode?: string | null;
  name: string | null;
  price: string;
  salePrice: string | null;
  stock: number;
  weight?: string | null;
  image: string | null;
  status: VariantStatus;
  attributeValueIds?: number[];
  attributes?: ProductAttributeRef[];
};

export type ProductAttributeValue = {
  id: number;
  value: string;
  attribute?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type ProductAttribute = {
  id: number;
  name: string;
  slug: string;
  sortOrder?: number;
  values?: Array<{
    id: number;
    value: string;
    slug: string;
    sortOrder?: number;
  }>;
};

export type ProductDetail = ProductListItem & {
  description: string | null;
  sku: string;
  brandId?: number;
  categoryId?: number;
  seoTitle: string | null;
  seoDescription: string | null;
  brand?: BrandSummary | null;
  category?: CategorySummary | null;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes?: ProductAttributeValue[];
  tags?: TagSummary[];
};

export type UpsertProductInput = {
  brandId: number;
  categoryId: number;
  name: string;
  sku: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
  published?: boolean;
  featured?: boolean;
  status?: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
  tagIds?: number[];
};

export type UpsertVariantInput = {
  sku: string;
  barcode?: string;
  name?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  weight?: number;
  image?: string;
  status?: VariantStatus;
  attributeValueIds?: number[];
};
