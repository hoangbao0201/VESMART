"use client";

import type { BrandListItem } from "@/lib/api/brands";
import { fieldClass, labelClass } from "./fieldStyles";

type BrandSelectorProps = {
  brands: BrandListItem[];
  value: number;
  onChange: (id: number) => void;
  error?: string;
  disabled?: boolean;
};

const BrandSelector = ({ brands, value, onChange, error, disabled }: BrandSelectorProps) => {
  return (
    <label className="block space-y-1.5">
      <span className={labelClass}>Thương hiệu *</span>
      <select
        className={fieldClass}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="">Chọn thương hiệu</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
};

export default BrandSelector;
