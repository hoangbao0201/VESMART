"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BrandListItem } from "@/lib/api/brands";
import type { CategoryListItem } from "@/lib/api/categories";
import { ApiClientError } from "@/lib/api/client";
import { buildPublicSlug, slugifyTitle } from "@/lib/markdown";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/product/product-form-schema";
import { emptyProductFormValues, productToFormValues } from "@/lib/product/map-product-form";
import { syncProductEditor } from "@/lib/product/sync-product";
import { useProductMediaUpload } from "@/hooks/useProductMediaUpload";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useVariantCombinations } from "@/hooks/useVariantCombinations";
import type { ProductDetail, ProductStatus } from "@/types/product";
import type { TagSummary } from "@/types/tag";
import DescriptionCard from "./DescriptionCard";
import GeneralInformationCard from "./GeneralInformationCard";
import ProductImageUploader from "./ProductImageUploader";
import ProductVariantTable from "./ProductVariantTable";
import SeoCard from "./SeoCard";
import StatusCard from "./StatusCard";
import StickyActionBar from "./StickyActionBar";
import TagSelector from "./TagSelector";
import VariantAttributeManager from "./VariantAttributeManager";
import { cardClass } from "./fieldStyles";

type ProductFormProps = {
  mode: "create" | "edit";
  brands: BrandListItem[];
  categoryOptions: Array<CategoryListItem & { label: string }>;
  tags: TagSummary[];
  initialProduct?: ProductDetail | null;
  onTagsChange: (tags: TagSummary[]) => void;
};

const ProductForm = ({
  mode,
  brands,
  categoryOptions,
  tags,
  initialProduct,
  onTagsChange,
}: ProductFormProps) => {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [toast, setToast] = useState<string | null>(null);
  const submitStatusRef = useRef<ProductStatus>("DRAFT");
  const initialVariantIds = useMemo(
    () => initialProduct?.variants?.map((v) => v.id) ?? [],
    [initialProduct],
  );
  const initialImageIds = useMemo(
    () => initialProduct?.images?.map((i) => i.id) ?? [],
    [initialProduct],
  );

  const defaults = useMemo(
    () =>
      initialProduct
        ? productToFormValues(initialProduct)
        : emptyProductFormValues({
            brandId: brands[0]?.id,
            categoryId: categoryOptions[0]?.id,
          }),
    [initialProduct, brands, categoryOptions],
  );

  const {
    register: _register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as never,
    defaultValues: defaults,
  });

  useUnsavedChangesWarning(isDirty && !isSubmitting);
  const { addFiles, addImageUrl } = useProductMediaUpload(getValues, setValue);
  const { generate } = useVariantCombinations(getValues, setValue);

  const name = watch("name");
  const slug = watch("slug");
  const values = watch();

  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugifyTitle(name), { shouldValidate: true });
    }
  }, [name, slugTouched, setValue]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const publicSlug = buildPublicSlug(slug || slugifyTitle(name), initialProduct?.id);

  const persist = async (formValues: ProductFormValues) => {
    const status = submitStatusRef.current;
    try {
      const saved = await syncProductEditor({
        mode,
        productId: initialProduct?.id,
        values: {
          ...formValues,
          status,
          published: status === "PUBLISHED",
        },
        status,
        initialVariantIds,
        initialImageIds,
      });
      setToast("Đã lưu sản phẩm");
      if (mode === "create") {
        router.push(`/admin/products/edit/${saved.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setError("root", {
        message:
          error instanceof ApiClientError
            ? error.message
            : "Không lưu được sản phẩm. Kiểm tra quyền ADMIN và API.",
      });
    }
  };

  const runSave = (status: ProductStatus) => {
    submitStatusRef.current = status;
    void handleSubmit(persist)();
  };

  return (
    <form
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-6">
        <GeneralInformationCard
          name={values.name}
          slug={values.slug}
          sku={values.sku}
          brandId={values.brandId}
          categoryId={values.categoryId}
          shortDescription={values.shortDescription ?? ""}
          brands={brands}
          categoryOptions={categoryOptions}
          publicSlugPreview={publicSlug}
          disabled={isSubmitting}
          errors={{
            name: errors.name?.message,
            slug: errors.slug?.message,
            sku: errors.sku?.message,
            brandId: errors.brandId?.message,
            categoryId: errors.categoryId?.message,
          }}
          onNameChange={(value) => setValue("name", value, { shouldDirty: true, shouldValidate: true })}
          onSlugChange={(value) => {
            setSlugTouched(true);
            setValue("slug", value, { shouldDirty: true, shouldValidate: true });
          }}
          onSkuChange={(value) => setValue("sku", value, { shouldDirty: true, shouldValidate: true })}
          onBrandChange={(id) => setValue("brandId", id, { shouldDirty: true, shouldValidate: true })}
          onCategoryChange={(id) =>
            setValue("categoryId", id, { shouldDirty: true, shouldValidate: true })
          }
          onShortDescriptionChange={(value) =>
            setValue("shortDescription", value, { shouldDirty: true })
          }
        />

        <ProductImageUploader
          images={values.images}
          thumbnail={values.thumbnail ?? ""}
          disabled={isSubmitting}
          error={errors.images?.message}
          onReorder={(images) => setValue("images", images, { shouldDirty: true })}
          onRemove={(clientId) => {
            const next = values.images.filter((img) => img.clientId !== clientId);
            setValue("images", next, { shouldDirty: true });
            if (values.thumbnail && !next.some((img) => img.imageUrl === values.thumbnail)) {
              setValue("thumbnail", next[0]?.imageUrl ?? "", { shouldDirty: true });
            }
          }}
          onSetThumbnail={(url) => setValue("thumbnail", url, { shouldDirty: true })}
          onAddFiles={addFiles}
          onAddUrl={addImageUrl}
        />

        <DescriptionCard
          value={values.description ?? ""}
          disabled={isSubmitting}
          onChange={(value) => setValue("description", value, { shouldDirty: true })}
        />

        <VariantAttributeManager
          axes={values.attributeAxes}
          disabled={isSubmitting}
          onChange={(axes) => setValue("attributeAxes", axes, { shouldDirty: true })}
          onGenerate={() => {
            const count = generate();
            setToast(count ? `Đã sinh ${count} biến thể` : "Chưa đủ thuộc tính để sinh");
          }}
        />

        <ProductVariantTable
          variants={values.variants}
          disabled={isSubmitting}
          error={errors.variants?.message || errors.variants?.root?.message}
          onChange={(variants) =>
            setValue("variants", variants, { shouldDirty: true, shouldValidate: true })
          }
        />

        <section className={cardClass}>
          <TagSelector
            tags={tags}
            value={values.tagIds}
            disabled={isSubmitting}
            onChange={(tagIds) => setValue("tagIds", tagIds, { shouldDirty: true })}
            onTagsChange={onTagsChange}
          />
        </section>

        {errors.root ? (
          <p className="rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errors.root.message}
          </p>
        ) : null}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <StatusCard
          status={values.status}
          featured={values.featured}
          published={values.published}
          disabled={isSubmitting}
          onStatusChange={(status) => setValue("status", status, { shouldDirty: true })}
          onFeaturedChange={(featured) => setValue("featured", featured, { shouldDirty: true })}
          onPublishedChange={(published) => setValue("published", published, { shouldDirty: true })}
        />
        <SeoCard
          seoTitle={values.seoTitle ?? ""}
          seoDescription={values.seoDescription ?? ""}
          titleFallback={values.name}
          slugPreview={publicSlug}
          disabled={isSubmitting}
          onSeoTitleChange={(value) => setValue("seoTitle", value, { shouldDirty: true })}
          onSeoDescriptionChange={(value) =>
            setValue("seoDescription", value, { shouldDirty: true })
          }
        />
        <StickyActionBar
          isSubmitting={isSubmitting}
          onSaveDraft={() => runSave("DRAFT")}
          onPublish={() => runSave("PUBLISHED")}
          onDiscard={() => {
            if (isDirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
            router.push("/admin#products");
          }}
        />
      </aside>

      {toast ? (
        <div className="fixed right-4 bottom-4 z-50 rounded-[12px] border border-border bg-card px-4 py-3 text-sm shadow-sm">
          {toast}
        </div>
      ) : null}
    </form>
  );
};

export default ProductForm;
