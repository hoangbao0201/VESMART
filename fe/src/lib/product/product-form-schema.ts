import { z } from "zod";

const variantSchema = z
  .object({
    clientId: z.string(),
    id: z.number().optional(),
    sku: z.string().min(1, "SKU biến thể bắt buộc").max(80),
    barcode: z.string().max(80).optional().or(z.literal("")),
    name: z.string().max(255).optional().or(z.literal("")),
    price: z.coerce.number().min(0, "Giá ≥ 0"),
    salePrice: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.coerce.number().min(0).optional(),
    ),
    stock: z.coerce.number().int().min(0),
    weight: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.coerce.number().min(0).optional(),
    ),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
    image: z.string().max(500).optional().or(z.literal("")),
    attributeValueIds: z.array(z.number()),
    attributeLabels: z.array(z.string()).optional(),
  })
  .superRefine((variant, ctx) => {
    const sale =
      variant.salePrice === null || variant.salePrice === undefined || Number.isNaN(variant.salePrice)
        ? null
        : variant.salePrice;
    if (sale != null && sale >= variant.price) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "Giá sale phải nhỏ hơn giá gốc",
      });
    }
  });

const imageSchema = z.object({
  clientId: z.string(),
  id: z.number().optional(),
  imageUrl: z.string().min(1),
  altText: z.string().max(255).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0),
  uploading: z.boolean().optional(),
  progress: z.number().optional(),
});

const axisValueSchema = z.object({
  clientId: z.string(),
  valueId: z.number().optional(),
  value: z.string(),
});

const attributeAxisSchema = z.object({
  clientId: z.string(),
  attributeId: z.number().optional(),
  name: z.string(),
  values: z.array(axisValueSchema),
});

export const productFormSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(255),
    slug: z
      .string()
      .max(220)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "Slug chỉ gồm a-z, 0-9 và dấu gạch ngang"),
    sku: z.string().min(1, "SKU bắt buộc").max(80),
    brandId: z.number().int().positive("Chọn thương hiệu"),
    categoryId: z.number().int().positive("Chọn danh mục"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    featured: z.boolean(),
    published: z.boolean(),
    shortDescription: z.string().max(500).optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    seoTitle: z.string().max(255).optional().or(z.literal("")),
    seoDescription: z.string().max(500).optional().or(z.literal("")),
    thumbnail: z.string().max(500).optional().or(z.literal("")),
    tagIds: z.array(z.number()),
    images: z.array(imageSchema),
    attributeAxes: z.array(attributeAxisSchema),
    variants: z.array(variantSchema),
  })
  .superRefine((data, ctx) => {
    if (data.status === "PUBLISHED" && data.variants.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Cần ít nhất 1 biến thể trước khi publish",
      });
    }
    const skus = data.variants.map((v) => v.sku.trim().toLowerCase()).filter(Boolean);
    const dup = skus.find((sku, i) => skus.indexOf(sku) !== i);
    if (dup) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: `SKU biến thể trùng: ${dup}`,
      });
    }
    if (data.images.some((img) => img.uploading)) {
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Đợi upload ảnh hoàn tất",
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductFormVariant = ProductFormValues["variants"][number];
export type ProductFormImage = ProductFormValues["images"][number];
