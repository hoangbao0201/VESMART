import { newClientId, type AttributeAxis } from "@/lib/product/variant-matrix";
import type { ProductFormValues } from "@/lib/product/product-form-schema";
import { stripIdFromSlug } from "@/lib/markdown";
import type { ProductDetail } from "@/types/product";

function numOrEmpty(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function emptyProductFormValues(defaults?: {
  brandId?: number;
  categoryId?: number;
}): ProductFormValues {
  return {
    name: "",
    slug: "",
    sku: "",
    brandId: defaults?.brandId ?? 0,
    categoryId: defaults?.categoryId ?? 0,
    status: "DRAFT",
    featured: false,
    published: false,
    shortDescription: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    thumbnail: "",
    tagIds: [],
    images: [],
    attributeAxes: [],
    variants: [],
  };
}

export function productToFormValues(product: ProductDetail): ProductFormValues {
  const axesMap = new Map<number, AttributeAxis>();

  for (const variant of product.variants ?? []) {
    for (const attr of variant.attributes ?? []) {
      const attributeId = attr.attribute?.id;
      if (!attributeId) continue;
      let axis = axesMap.get(attributeId);
      if (!axis) {
        axis = {
          clientId: newClientId("axis"),
          attributeId,
          name: attr.attribute?.name ?? "Attribute",
          values: [],
        };
        axesMap.set(attributeId, axis);
      }
      if (!axis.values.some((v) => v.valueId === attr.id)) {
        axis.values.push({
          clientId: newClientId("val"),
          valueId: attr.id,
          value: attr.value,
        });
      }
    }
  }

  return {
    name: product.name,
    slug: stripIdFromSlug(product.slug, product.id),
    sku: product.sku,
    brandId: product.brandId ?? product.brand?.id ?? 0,
    categoryId: product.categoryId ?? product.category?.id ?? 0,
    status: product.status ?? (product.published ? "PUBLISHED" : "DRAFT"),
    featured: product.featured,
    published: product.published ?? product.status === "PUBLISHED",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    thumbnail: product.thumbnail ?? "",
    tagIds: product.tags?.map((t) => t.id) ?? [],
    images: (product.images ?? []).map((img, index) => ({
      clientId: newClientId("img"),
      id: img.id,
      imageUrl: img.imageUrl,
      altText: img.altText ?? "",
      sortOrder: img.sortOrder ?? index,
    })),
    attributeAxes: Array.from(axesMap.values()),
    variants: (product.variants ?? []).map((variant) => ({
      clientId: newClientId("var"),
      id: variant.id,
      sku: variant.sku,
      barcode: variant.barcode ?? "",
      name: variant.name ?? "",
      price: Number(variant.price),
      salePrice: numOrEmpty(variant.salePrice) ?? undefined,
      stock: variant.stock,
      weight: numOrEmpty(variant.weight) ?? undefined,
      status: variant.status,
      image: variant.image ?? "",
      attributeValueIds: variant.attributeValueIds ?? variant.attributes?.map((a) => a.id) ?? [],
      attributeLabels: variant.attributes?.map((a) => a.value) ?? [],
    })),
  };
}
