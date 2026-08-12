import {
  addProductImage,
  createProduct,
  createProductAttribute,
  createProductAttributeValue,
  createProductVariant,
  deleteProductImage,
  deleteProductVariant,
  getProductById,
  listProductAttributes,
  reorderProductImages,
  updateProduct,
  updateProductVariant,
} from "@/lib/api/products";
import type { ProductFormValues } from "@/lib/product/product-form-schema";
import type { ProductDetail, ProductStatus } from "@/types/product";

function cleanOptionalNumber(value: number | null | undefined): number | undefined {
  if (value == null || Number.isNaN(value)) return undefined;
  return value;
}

async function resolveAttributeValueIds(values: ProductFormValues) {
  const catalog = await listProductAttributes();
  const byName = new Map(catalog.map((a) => [a.name.trim().toLowerCase(), a]));
  const valueIdByClientId = new Map<string, number>();

  for (const axis of values.attributeAxes) {
    const key = axis.name.trim().toLowerCase();
    if (!key) continue;

    let attribute = axis.attributeId
      ? catalog.find((a) => a.id === axis.attributeId)
      : byName.get(key);

    if (!attribute) {
      attribute = await createProductAttribute({ name: axis.name.trim() });
      catalog.push(attribute);
      byName.set(key, attribute);
    }

    const existingValues = [...(attribute.values ?? [])];
    for (const value of axis.values) {
      const label = value.value.trim();
      if (!label) continue;
      let match =
        value.valueId != null
          ? existingValues.find((v) => v.id === value.valueId)
          : existingValues.find((v) => v.value.trim().toLowerCase() === label.toLowerCase());
      if (!match) {
        match = await createProductAttributeValue(attribute.id, { value: label });
        existingValues.push(match);
        attribute.values = existingValues;
      }
      valueIdByClientId.set(value.clientId, match.id);
    }
  }

  return valueIdByClientId;
}

function resolveVariantAttributeIds(
  variant: ProductFormValues["variants"][number],
  values: ProductFormValues,
  valueIdByClientId: Map<string, number>,
): number[] {
  if (variant.attributeValueIds.length > 0) {
    return variant.attributeValueIds;
  }

  const ids: number[] = [];
  for (const label of variant.attributeLabels ?? []) {
    for (const axis of values.attributeAxes) {
      const found = axis.values.find(
        (v) => v.value.trim().toLowerCase() === label.trim().toLowerCase(),
      );
      if (!found) continue;
      const id = found.valueId ?? valueIdByClientId.get(found.clientId);
      if (id != null && !ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

export async function syncProductEditor(options: {
  mode: "create" | "edit";
  productId?: number;
  values: ProductFormValues;
  status: ProductStatus;
  initialVariantIds?: number[];
  initialImageIds?: number[];
}): Promise<ProductDetail> {
  const { mode, values, status } = options;
  const published = status === "PUBLISHED";

  const shell = {
    brandId: values.brandId,
    categoryId: values.categoryId,
    name: values.name.trim(),
    sku: values.sku.trim(),
    slug: values.slug.trim() || undefined,
    shortDescription: values.shortDescription?.trim() || undefined,
    description: values.description?.trim() || undefined,
    thumbnail: values.thumbnail?.trim() || values.images[0]?.imageUrl || undefined,
    featured: values.featured,
    published,
    status,
    seoTitle: values.seoTitle?.trim() || undefined,
    seoDescription: values.seoDescription?.trim() || undefined,
    tagIds: values.tagIds,
  };

  let product =
    mode === "edit" && options.productId
      ? await updateProduct(options.productId, shell)
      : await createProduct(shell);

  const productId = product.id;
  const valueIdByClientId = await resolveAttributeValueIds(values);

  const keepImageIds = new Set(
    values.images.filter((img) => img.id != null).map((img) => img.id as number),
  );
  for (const imageId of options.initialImageIds ?? []) {
    if (!keepImageIds.has(imageId)) {
      await deleteProductImage(imageId);
    }
  }

  const orderedIds: number[] = [];
  for (const [index, image] of values.images.entries()) {
    if (image.id) {
      orderedIds.push(image.id);
      continue;
    }
    if (!image.imageUrl || image.uploading) continue;
    const created = await addProductImage(productId, {
      imageUrl: image.imageUrl,
      altText: image.altText || undefined,
      sortOrder: index,
    });
    orderedIds.push(created.id);
  }
  if (orderedIds.length) {
    await reorderProductImages(productId, orderedIds);
  }

  const keepVariantIds = new Set(
    values.variants.filter((v) => v.id != null).map((v) => v.id as number),
  );
  for (const variantId of options.initialVariantIds ?? []) {
    if (!keepVariantIds.has(variantId)) {
      await deleteProductVariant(variantId);
    }
  }

  for (const variant of values.variants) {
    const attributeValueIds = resolveVariantAttributeIds(variant, values, valueIdByClientId);
    const payload = {
      sku: variant.sku.trim(),
      barcode: variant.barcode?.trim() || undefined,
      name: variant.name?.trim() || undefined,
      price: variant.price,
      salePrice: cleanOptionalNumber(variant.salePrice),
      stock: variant.stock,
      weight: cleanOptionalNumber(variant.weight),
      image: variant.image?.trim() || undefined,
      status: variant.status,
      attributeValueIds,
    };

    if (variant.id) {
      await updateProductVariant(variant.id, payload);
    } else {
      await createProductVariant(productId, payload);
    }
  }

  const refreshed = await getProductById(productId);
  if (!refreshed) return product;

  if (values.thumbnail?.trim() || refreshed.images?.[0]?.imageUrl) {
    return updateProduct(productId, {
      thumbnail: values.thumbnail?.trim() || refreshed.images[0]?.imageUrl,
      tagIds: values.tagIds,
    });
  }

  return refreshed;
}
