"use client";

import { fieldClass, labelClass } from "./fieldStyles";

type InventoryFieldsProps = {
  stock: number;
  weight?: number | null;
  onStockChange: (value: number) => void;
  onWeightChange: (value: number | undefined) => void;
  disabled?: boolean;
};

const InventoryFields = ({
  stock,
  weight,
  onStockChange,
  onWeightChange,
  disabled,
}: InventoryFieldsProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block space-y-1.5">
        <span className={labelClass}>Tồn kho</span>
        <input
          type="number"
          min={0}
          step={1}
          className={fieldClass}
          value={stock}
          disabled={disabled}
          onChange={(e) => onStockChange(Number(e.target.value))}
        />
      </label>
      <label className="block space-y-1.5">
        <span className={labelClass}>Khối lượng (kg)</span>
        <input
          type="number"
          min={0}
          step="0.001"
          className={fieldClass}
          value={weight ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onWeightChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      </label>
    </div>
  );
};

export default InventoryFields;
