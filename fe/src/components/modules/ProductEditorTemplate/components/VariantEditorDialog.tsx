"use client";

import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import type { ProductFormVariant } from "@/lib/product/product-form-schema";
import InventoryFields from "./InventoryFields";
import PricingFields from "./PricingFields";
import { fieldClass, labelClass } from "./fieldStyles";

type VariantEditorDialogProps = {
  open: boolean;
  variant: ProductFormVariant | null;
  onOpenChange: (open: boolean) => void;
  onChange: (variant: ProductFormVariant) => void;
  onSave: () => void;
};

const VariantEditorDialog = ({
  open,
  variant,
  onOpenChange,
  onChange,
  onSave,
}: VariantEditorDialogProps) => {
  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Chỉnh sửa biến thể">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className={labelClass}>Tên</span>
            <input
              className={fieldClass}
              value={variant.name ?? ""}
              onChange={(e) => onChange({ ...variant, name: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className={labelClass}>SKU *</span>
              <input
                className={fieldClass}
                value={variant.sku}
                onChange={(e) => onChange({ ...variant, sku: e.target.value })}
              />
            </label>
            <label className="block space-y-1.5">
              <span className={labelClass}>Barcode</span>
              <input
                className={fieldClass}
                value={variant.barcode ?? ""}
                onChange={(e) => onChange({ ...variant, barcode: e.target.value })}
              />
            </label>
          </div>
          <PricingFields
            price={variant.price}
            salePrice={variant.salePrice}
            onPriceChange={(price) => onChange({ ...variant, price })}
            onSalePriceChange={(salePrice) => onChange({ ...variant, salePrice })}
          />
          <InventoryFields
            stock={variant.stock}
            weight={variant.weight}
            onStockChange={(stock) => onChange({ ...variant, stock })}
            onWeightChange={(weight) => onChange({ ...variant, weight })}
          />
          <label className="block space-y-1.5">
            <span className={labelClass}>Status</span>
            <select
              className={fieldClass}
              value={variant.status}
              onChange={(e) =>
                onChange({
                  ...variant,
                  status: e.target.value as ProductFormVariant["status"],
                })
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className={labelClass}>Ảnh biến thể (URL)</span>
            <input
              className={fieldClass}
              value={variant.image ?? ""}
              onChange={(e) => onChange({ ...variant, image: e.target.value })}
            />
          </label>
          {(variant.attributeLabels?.length ?? 0) > 0 ? (
            <p className="text-xs text-muted-foreground">
              Attributes: {variant.attributeLabels?.join(" · ")}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button type="button" onClick={onSave}>
              Xong
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VariantEditorDialog;
