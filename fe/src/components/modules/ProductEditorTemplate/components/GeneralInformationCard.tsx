"use client";

import type { BrandListItem } from "@/lib/api/brands";
import type { CategoryListItem } from "@/lib/api/categories";
import BrandSelector from "./BrandSelector";
import CategorySelector from "./CategorySelector";
import { cardClass, fieldClass, labelClass } from "./fieldStyles";

type GeneralInformationCardProps = {
  name: string;
  slug: string;
  sku: string;
  brandId: number;
  categoryId: number;
  shortDescription: string;
  brands: BrandListItem[];
  categoryOptions: Array<CategoryListItem & { label: string }>;
  publicSlugPreview: string;
  errors?: Partial<Record<"name" | "slug" | "sku" | "brandId" | "categoryId" | "shortDescription", string>>;
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSkuChange: (value: string) => void;
  onBrandChange: (id: number) => void;
  onCategoryChange: (id: number) => void;
  onShortDescriptionChange: (value: string) => void;
};

const GeneralInformationCard = ({
  name,
  slug,
  sku,
  brandId,
  categoryId,
  shortDescription,
  brands,
  categoryOptions,
  publicSlugPreview,
  errors,
  disabled,
  onNameChange,
  onSlugChange,
  onSkuChange,
  onBrandChange,
  onCategoryChange,
  onShortDescriptionChange,
}: GeneralInformationCardProps) => {
  return (
    <section className={`${cardClass} space-y-4`}>
      <h2 className="text-sm font-semibold">Thông tin chung</h2>
      <label className="block space-y-1.5">
        <span className={labelClass}>Tên sản phẩm *</span>
        <input
          className={fieldClass}
          value={name}
          disabled={disabled}
          maxLength={255}
          onChange={(e) => onNameChange(e.target.value)}
        />
        {errors?.name ? <span className="text-xs text-destructive">{errors.name}</span> : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={labelClass}>Slug</span>
          <input
            className={fieldClass}
            value={slug}
            disabled={disabled}
            onChange={(e) => onSlugChange(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">/products/{publicSlugPreview}</span>
          {errors?.slug ? <span className="block text-xs text-destructive">{errors.slug}</span> : null}
        </label>
        <label className="block space-y-1.5">
          <span className={labelClass}>SKU *</span>
          <input
            className={fieldClass}
            value={sku}
            disabled={disabled}
            maxLength={80}
            onChange={(e) => onSkuChange(e.target.value)}
          />
          {errors?.sku ? <span className="text-xs text-destructive">{errors.sku}</span> : null}
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BrandSelector
          brands={brands}
          value={brandId}
          disabled={disabled}
          error={errors?.brandId}
          onChange={onBrandChange}
        />
        <CategorySelector
          options={categoryOptions}
          value={categoryId}
          disabled={disabled}
          error={errors?.categoryId}
          onChange={onCategoryChange}
        />
      </div>
      <label className="block space-y-1.5">
        <span className={labelClass}>Mô tả ngắn</span>
        <textarea
          className={`${fieldClass} h-24 py-2`}
          value={shortDescription}
          disabled={disabled}
          maxLength={500}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
        />
      </label>
    </section>
  );
};

export default GeneralInformationCard;
