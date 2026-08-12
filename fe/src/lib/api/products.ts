import {
  apiDelete,
  apiGet,
  apiGetListSafe,
  apiGetPageSafe,
  apiGetSafe,
  apiPatch,
  apiPost,
} from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type {
  ProductAttribute,
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductStatus,
  ProductVariant,
  UpsertProductInput,
  UpsertVariantInput,
} from "@/types/product";

export type ListProductsParams = {
  page?: number;
  limit?: number;
  featured?: boolean;
  search?: string;
  brandSlug?: string;
  categorySlug?: string;
  sort?: string;
};

export async function listProducts(params: ListProductsParams = {}): Promise<ProductListItem[]> {
  return apiGetListSafe<ProductListItem>("/products", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      featured: params.featured,
      search: params.search,
      brandSlug: params.brandSlug,
      categorySlug: params.categorySlug,
      sort: params.sort ?? "created_at:desc",
      published: true,
      status: "PUBLISHED",
    },
  });
}

export async function listProductsPage(
  params: ListProductsParams = {},
): Promise<PaginatedData<ProductListItem>> {
  return apiGetPageSafe<ProductListItem>("/products", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      featured: params.featured,
      search: params.search,
      brandSlug: params.brandSlug,
      categorySlug: params.categorySlug,
      sort: params.sort ?? "created_at:desc",
      published: true,
      status: "PUBLISHED",
    },
    emptyPage: params.page ?? 1,
    emptyLimit: params.limit ?? 12,
  });
}

export async function listFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  return listProducts({ featured: true, limit, sort: "updated_at:desc" });
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return apiGetSafe<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
    revalidate: 60,
  });
}

export async function getProductById(id: string | number): Promise<ProductDetail | null> {
  try {
    return await apiGet<ProductDetail>(`/products/id/${encodeURIComponent(String(id))}`, {
      auth: true,
      revalidate: false,
    });
  } catch {
    return null;
  }
}

export async function getProductVariants(productId: string | number) {
  try {
    return await apiGet<{ items: ProductDetail["variants"] } | ProductDetail["variants"]>(
      `/products/${encodeURIComponent(String(productId))}/variants`,
      { revalidate: 60 },
    );
  } catch {
    return null;
  }
}

export async function listProductsAdmin(params: {
  page?: number;
  limit?: number;
  status?: ProductStatus;
} = {}): Promise<ProductListItem[]> {
  const data = await apiGet<PaginatedData<ProductListItem> | ProductListItem[]>("/products", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: "created_at:desc",
      ...(params.status ? { status: params.status } : {}),
    },
    revalidate: false,
  });
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function createProduct(input: UpsertProductInput): Promise<ProductDetail> {
  return apiPost<ProductDetail>("/products", {
    auth: true,
    body: {
      brandId: Number(input.brandId),
      categoryId: Number(input.categoryId),
      name: input.name,
      sku: input.sku,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
      shortDescription: input.shortDescription,
      description: input.description,
      thumbnail: input.thumbnail,
      published: input.published ?? false,
      featured: input.featured ?? false,
      status: input.status ?? "DRAFT",
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      tagIds: input.tagIds,
    },
  });
}

export async function updateProduct(
  id: string | number,
  input: Partial<UpsertProductInput>,
): Promise<ProductDetail> {
  return apiPatch<ProductDetail>(`/products/${encodeURIComponent(String(id))}`, {
    auth: true,
    body: {
      ...(input.brandId != null ? { brandId: Number(input.brandId) } : {}),
      ...(input.categoryId != null ? { categoryId: Number(input.categoryId) } : {}),
      ...(input.name != null ? { name: input.name } : {}),
      ...(input.sku != null ? { sku: input.sku } : {}),
      ...(input.slug !== undefined ? { slug: input.slug?.trim() || undefined } : {}),
      ...(input.shortDescription !== undefined
        ? { shortDescription: input.shortDescription }
        : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.status != null ? { status: input.status } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      ...(input.tagIds !== undefined ? { tagIds: input.tagIds } : {}),
    },
  });
}

export async function createProductVariant(
  productId: string | number,
  input: UpsertVariantInput,
): Promise<ProductVariant> {
  return apiPost<ProductVariant>(
    `/products/${encodeURIComponent(String(productId))}/variants`,
    {
      auth: true,
      body: {
        sku: input.sku,
        barcode: input.barcode || undefined,
        name: input.name || undefined,
        price: input.price,
        salePrice: input.salePrice,
        stock: input.stock ?? 0,
        weight: input.weight,
        image: input.image || undefined,
        status: input.status ?? "ACTIVE",
        attributeValueIds: input.attributeValueIds,
      },
    },
  );
}

export async function updateProductVariant(
  variantId: string | number,
  input: Partial<UpsertVariantInput>,
): Promise<ProductVariant> {
  return apiPatch<ProductVariant>(`/variants/${encodeURIComponent(String(variantId))}`, {
    auth: true,
    body: {
      ...(input.sku != null ? { sku: input.sku } : {}),
      ...(input.barcode !== undefined ? { barcode: input.barcode || undefined } : {}),
      ...(input.name !== undefined ? { name: input.name || undefined } : {}),
      ...(input.price != null ? { price: input.price } : {}),
      ...(input.salePrice !== undefined ? { salePrice: input.salePrice } : {}),
      ...(input.stock != null ? { stock: input.stock } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.image !== undefined ? { image: input.image || undefined } : {}),
      ...(input.status != null ? { status: input.status } : {}),
      ...(input.attributeValueIds !== undefined
        ? { attributeValueIds: input.attributeValueIds }
        : {}),
    },
  });
}

export async function deleteProductVariant(variantId: string | number): Promise<void> {
  await apiDelete<null>(`/variants/${encodeURIComponent(String(variantId))}`, {
    auth: true,
  });
}

export async function addProductImage(
  productId: string | number,
  input: { imageUrl: string; altText?: string; sortOrder?: number },
): Promise<ProductImage> {
  return apiPost<ProductImage>(
    `/products/${encodeURIComponent(String(productId))}/images`,
    {
      auth: true,
      body: {
        imageUrl: input.imageUrl,
        altText: input.altText,
        sortOrder: input.sortOrder ?? 0,
      },
    },
  );
}

export async function reorderProductImages(
  productId: string | number,
  imageIds: number[],
): Promise<ProductDetail> {
  return apiPatch<ProductDetail>(
    `/products/${encodeURIComponent(String(productId))}/images/reorder`,
    {
      auth: true,
      body: { imageIds },
    },
  );
}

export async function deleteProductImage(imageId: string | number): Promise<void> {
  await apiDelete<null>(`/product-images/${encodeURIComponent(String(imageId))}`, {
    auth: true,
  });
}

export async function listProductAttributes(): Promise<ProductAttribute[]> {
  const data = await apiGet<{ items: ProductAttribute[] } | ProductAttribute[]>(
    "/product-attributes",
    { revalidate: false, auth: true },
  );
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function createProductAttribute(input: {
  name: string;
  slug?: string;
}): Promise<ProductAttribute> {
  return apiPost<ProductAttribute>("/product-attributes", {
    auth: true,
    body: {
      name: input.name,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}

export async function createProductAttributeValue(
  attributeId: string | number,
  input: { value: string; slug?: string },
): Promise<{ id: number; value: string; slug: string }> {
  return apiPost(`/product-attributes/${encodeURIComponent(String(attributeId))}/values`, {
    auth: true,
    body: {
      value: input.value,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}
