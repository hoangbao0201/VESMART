"use client";

import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import EmptyState from "@/components/ui/EmptyState";
import type { ProductFormVariant } from "@/lib/product/product-form-schema";
import { newClientId } from "@/lib/product/variant-matrix";
import VariantEditorDialog from "./VariantEditorDialog";
import { cardClass, fieldClass } from "./fieldStyles";

type ProductVariantTableProps = {
  variants: ProductFormVariant[];
  disabled?: boolean;
  error?: string;
  onChange: (variants: ProductFormVariant[]) => void;
};

const ProductVariantTable = ({
  variants,
  disabled,
  error,
  onChange,
}: ProductVariantTableProps) => {
  const [editing, setEditing] = useState<ProductFormVariant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const upsert = (variant: ProductFormVariant) => {
    const exists = variants.some((v) => v.clientId === variant.clientId);
    onChange(
      exists
        ? variants.map((v) => (v.clientId === variant.clientId ? variant : v))
        : [...variants, variant],
    );
  };

  const addBlank = () => {
    const variant: ProductFormVariant = {
      clientId: newClientId("var"),
      sku: "",
      barcode: "",
      name: "",
      price: 0,
      salePrice: undefined,
      stock: 0,
      weight: undefined,
      status: "ACTIVE",
      image: "",
      attributeValueIds: [],
      attributeLabels: [],
    };
    setEditing(variant);
  };

  return (
    <section className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Biến thể</h2>
          <p className="mt-1 text-xs text-muted-foreground">{variants.length} SKU</p>
        </div>
        <Button type="button" size="sm" disabled={disabled} onClick={addBlank}>
          <Plus className="size-4" />
          Thêm biến thể
        </Button>
      </div>

      {variants.length === 0 ? (
        <EmptyState
          title="Chưa có biến thể"
          description="Sinh từ thuộc tính hoặc thêm thủ công."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-[12px] border border-border md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Variant</th>
                  <th className="px-3 py-2.5 font-medium">SKU</th>
                  <th className="px-3 py-2.5 font-medium">Price</th>
                  <th className="px-3 py-2.5 font-medium">Sale</th>
                  <th className="px-3 py-2.5 font-medium">Stock</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((variant) => (
                  <tr key={variant.clientId}>
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{variant.name || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {(variant.attributeLabels ?? []).join(" · ") || "Manual"}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        className={`${fieldClass} h-9`}
                        value={variant.sku}
                        disabled={disabled}
                        onChange={(e) =>
                          upsert({ ...variant, sku: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        className={`${fieldClass} h-9`}
                        value={variant.price}
                        disabled={disabled}
                        onChange={(e) =>
                          upsert({ ...variant, price: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        className={`${fieldClass} h-9`}
                        value={variant.salePrice ?? ""}
                        disabled={disabled}
                        onChange={(e) =>
                          upsert({
                            ...variant,
                            salePrice:
                              e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        className={`${fieldClass} h-9`}
                        value={variant.stock}
                        disabled={disabled}
                        onChange={(e) =>
                          upsert({ ...variant, stock: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{variant.status}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-[8px] p-1.5 hover:bg-secondary"
                          disabled={disabled}
                          onClick={() => setEditing(variant)}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-[8px] p-1.5 hover:bg-secondary"
                          disabled={disabled}
                          onClick={() =>
                            onChange([
                              ...variants,
                              {
                                ...variant,
                                clientId: newClientId("var"),
                                id: undefined,
                                sku: `${variant.sku}-COPY`,
                              },
                            ])
                          }
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-[8px] p-1.5 text-destructive hover:bg-destructive/10"
                          disabled={disabled}
                          onClick={() => setDeleteId(variant.clientId)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {variants.map((variant) => (
              <div key={variant.clientId} className="rounded-[12px] border border-border p-3">
                <div className="font-medium">{variant.name || variant.sku}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {variant.price.toLocaleString("vi-VN")} · stock {variant.stock}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(variant)}>
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(variant.clientId)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <VariantEditorDialog
        open={!!editing}
        variant={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onChange={setEditing}
        onSave={() => {
          if (editing) upsert(editing);
          setEditing(null);
        }}
      />

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent title="Xóa biến thể?">
          <p className="text-sm text-muted-foreground">
            Biến thể sẽ bị xóa khi bạn lưu sản phẩm. Thao tác không thể hoàn tác trên server.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteId(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onChange(variants.filter((v) => v.clientId !== deleteId));
                setDeleteId(null);
              }}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductVariantTable;
