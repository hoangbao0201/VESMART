"use client";

import { fieldClass, labelClass } from "./fieldStyles";

type PricingFieldsProps = {
  price: number;
  salePrice?: number | null;
  onPriceChange: (value: number) => void;
  onSalePriceChange: (value: number | undefined) => void;
  errors?: { price?: string; salePrice?: string };
  disabled?: boolean;
};

const PricingFields = ({
  price,
  salePrice,
  onPriceChange,
  onSalePriceChange,
  errors,
  disabled,
}: PricingFieldsProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block space-y-1.5">
        <span className={labelClass}>Giá *</span>
        <input
          type="number"
          min={0}
          step="1000"
          className={fieldClass}
          value={Number.isFinite(price) ? price : 0}
          disabled={disabled}
          onChange={(e) => onPriceChange(Number(e.target.value))}
        />
        {errors?.price ? <span className="text-xs text-destructive">{errors.price}</span> : null}
      </label>
      <label className="block space-y-1.5">
        <span className={labelClass}>Giá sale</span>
        <input
          type="number"
          min={0}
          step="1000"
          className={fieldClass}
          value={salePrice ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onSalePriceChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
        {errors?.salePrice ? (
          <span className="text-xs text-destructive">{errors.salePrice}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Phải nhỏ hơn giá gốc</span>
        )}
      </label>
    </div>
  );
};

export default PricingFields;
