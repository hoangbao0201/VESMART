"use client";

import { Button } from "@/components/ui/Button";
import { newClientId, type AttributeAxis } from "@/lib/product/variant-matrix";
import { cardClass, fieldClass, labelClass } from "./fieldStyles";

type VariantAttributeManagerProps = {
  axes: AttributeAxis[];
  disabled?: boolean;
  onChange: (axes: AttributeAxis[]) => void;
  onGenerate: () => void;
};

const VariantAttributeManager = ({
  axes,
  disabled,
  onChange,
  onGenerate,
}: VariantAttributeManagerProps) => {
  const updateAxis = (clientId: string, patch: Partial<AttributeAxis>) => {
    onChange(axes.map((axis) => (axis.clientId === clientId ? { ...axis, ...patch } : axis)));
  };

  return (
    <section className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Thuộc tính biến thể</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ví dụ: Màu × Dung lượng → sinh tổ hợp tự động
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() =>
              onChange([
                ...axes,
                {
                  clientId: newClientId("axis"),
                  name: "",
                  values: [{ clientId: newClientId("val"), value: "" }],
                },
              ])
            }
          >
            Thêm thuộc tính
          </Button>
          <Button type="button" size="sm" disabled={disabled} onClick={onGenerate}>
            Sinh biến thể
          </Button>
        </div>
      </div>

      {axes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có thuộc tính. Thêm Color, Storage…</p>
      ) : (
        <div className="space-y-4">
          {axes.map((axis) => (
            <div key={axis.clientId} className="rounded-[12px] border border-border p-3">
              <div className="mb-3 flex flex-wrap items-end gap-2">
                <label className="block min-w-[180px] flex-1 space-y-1.5">
                  <span className={labelClass}>Tên thuộc tính</span>
                  <input
                    className={fieldClass}
                    placeholder="Color"
                    value={axis.name}
                    disabled={disabled}
                    onChange={(e) => updateAxis(axis.clientId, { name: e.target.value })}
                  />
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => onChange(axes.filter((a) => a.clientId !== axis.clientId))}
                >
                  Xóa
                </Button>
              </div>
              <div className="space-y-2">
                {axis.values.map((value) => (
                  <div key={value.clientId} className="flex gap-2">
                    <input
                      className={fieldClass}
                      placeholder="White"
                      value={value.value}
                      disabled={disabled}
                      onChange={(e) =>
                        updateAxis(axis.clientId, {
                          values: axis.values.map((v) =>
                            v.clientId === value.clientId
                              ? { ...v, value: e.target.value }
                              : v,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={disabled}
                      onClick={() =>
                        updateAxis(axis.clientId, {
                          values: axis.values.filter((v) => v.clientId !== value.clientId),
                        })
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={disabled}
                  onClick={() =>
                    updateAxis(axis.clientId, {
                      values: [...axis.values, { clientId: newClientId("val"), value: "" }],
                    })
                  }
                >
                  Thêm giá trị
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default VariantAttributeManager;
