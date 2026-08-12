"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import type { ProductVariant } from "@/types/product";
import {
  effectiveUnitPrice,
  formatMoneyOrContact,
  parseMoney,
} from "@/lib/product/pricing";
import { formatPrice } from "@/lib/utils/format";
import { SITE_CONFIG, sitePhoneTelHref } from "@/configs/site.config";
import { cn } from "@/lib/utils/cn";

type VariantPurchaseCardProps = {
  productId: number;
  productSlug: string;
  productName: string;
  thumbnail: string | null;
  variants: ProductVariant[];
  className?: string;
};

type OptionAxis = {
  attributeId: number;
  name: string;
  values: Array<{ valueId: number; label: string }>;
};

type SelectedMap = Record<number, number>; // attributeId -> valueId

function buildOptionAxes(variants: ProductVariant[]): OptionAxis[] {
  const map = new Map<number, OptionAxis>();
  for (const variant of variants) {
    for (const attr of variant.attributes ?? []) {
      const attributeId = attr.attribute?.id;
      if (!attributeId) continue;
      let axis = map.get(attributeId);
      if (!axis) {
        axis = {
          attributeId,
          name: attr.attribute?.name ?? "Phân loại",
          values: [],
        };
        map.set(attributeId, axis);
      }
      if (!axis.values.some((v) => v.valueId === attr.id)) {
        axis.values.push({ valueId: attr.id, label: attr.value });
      }
    }
  }
  return Array.from(map.values());
}

function buildDefaultSelections(
  variants: ProductVariant[],
  axes: OptionAxis[],
): SelectedMap {
  const first = variants[0];
  if (!first) return {};
  if ((first.attributes?.length ?? 0) > 0) {
    const selected: SelectedMap = {};
    for (const attr of first.attributes ?? []) {
      const attributeId = attr.attribute?.id;
      if (attributeId) selected[attributeId] = attr.id;
    }
    return selected;
  }
  const selected: SelectedMap = {};
  for (const axis of axes) {
    if (axis.values[0]) selected[axis.attributeId] = axis.values[0].valueId;
  }
  return selected;
}

function findMatchingVariant(
  variants: ProductVariant[],
  axes: OptionAxis[],
  selected: SelectedMap,
): ProductVariant | null {
  if (!variants.length) return null;
  if (!axes.length) return variants[0];

  const hasAll = axes.every((axis) => Boolean(selected[axis.attributeId]));
  if (!hasAll) return null;

  return (
    variants.find((variant) =>
      axes.every((axis) => {
        const valueId = selected[axis.attributeId];
        return (variant.attributes ?? []).some(
          (attr) => attr.attribute?.id === axis.attributeId && attr.id === valueId,
        );
      }),
    ) ?? null
  );
}

const VariantPurchaseCard = ({
  productId,
  productSlug,
  productName,
  thumbnail,
  variants,
  className,
}: VariantPurchaseCardProps) => {
  const router = useRouter();
  const { addItem } = useCart();
  const activeVariants = useMemo(
    () => variants.filter((v) => v.status !== "INACTIVE"),
    [variants],
  );
  const optionAxes = useMemo(
    () => buildOptionAxes(activeVariants),
    [activeVariants],
  );
  const useOptionAxes = optionAxes.length > 0;

  const [selectedOptions, setSelectedOptions] = useState<SelectedMap>(() =>
    buildDefaultSelections(activeVariants, optionAxes),
  );
  const [selectedId, setSelectedId] = useState<number | null>(
    activeVariants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOptions(buildDefaultSelections(activeVariants, optionAxes));
    setSelectedId(activeVariants[0]?.id ?? null);
    setQuantity(1);
  }, [activeVariants, optionAxes]);

  const selected = useMemo(() => {
    if (useOptionAxes) {
      return findMatchingVariant(activeVariants, optionAxes, selectedOptions);
    }
    return activeVariants.find((v) => v.id === selectedId) ?? activeVariants[0] ?? null;
  }, [
    useOptionAxes,
    activeVariants,
    optionAxes,
    selectedOptions,
    selectedId,
  ]);

  const unitAmount = selected
    ? effectiveUnitPrice(selected.salePrice, selected.price)
    : null;
  const listAmount = selected ? parseMoney(selected.price) : null;
  const displayPrice = formatMoneyOrContact(unitAmount);
  const showStrike =
    unitAmount !== null && listAmount !== null && listAmount > unitAmount;
  const outOfStock =
    !selected || selected.status === "OUT_OF_STOCK" || selected.stock <= 0;
  const noPrice = unitAmount === null;
  const mustChoose = useOptionAxes && !selected;
  const canPurchase = Boolean(selected) && !outOfStock && !noPrice && !mustChoose;
  const maxQty = selected?.stock ?? 1;

  useEffect(() => {
    if (!canPurchase || maxQty <= 0) {
      setQuantity((q) => (q > 0 && canPurchase ? Math.min(q, Math.max(maxQty, 1)) : q));
      return;
    }
    setQuantity((q) => {
      if (q <= 0) return 1;
      if (q > maxQty) return maxQty;
      return q;
    });
  }, [canPurchase, maxQty]);

  const addSelectedToCart = (): boolean => {
    if (!selected || !canPurchase) {
      setError(
        mustChoose
          ? "Vui lòng chọn đầy đủ phân loại sản phẩm."
          : noPrice
            ? `Sản phẩm chưa có giá. Liên hệ ${SITE_CONFIG.phone} để đặt hàng.`
            : null,
      );
      return false;
    }
    const ok = addItem({
      productId,
      productSlug,
      productName,
      thumbnail: selected.image ?? thumbnail,
      variantId: selected.id,
      variantName: selected.name,
      sku: selected.sku,
      salePrice: selected.salePrice,
      listPrice: selected.price,
      quantity,
      stock: selected.stock,
    });
    if (!ok) {
      setError(`Không thêm được. Liên hệ ${SITE_CONFIG.phone} để đặt hàng.`);
      return false;
    }
    setError(null);
    return true;
  };

  const onAddToCart = () => {
    if (!addSelectedToCart()) return;
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  const onBuyNow = () => {
    if (!addSelectedToCart()) return;
    router.push("/cart");
  };

  if (activeVariants.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">Chưa có biến thể bán hàng.</p>
        <a
          href={sitePhoneTelHref()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Liên hệ {SITE_CONFIG.phone}
        </a>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="rounded-[12px] bg-secondary/60 px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-rose-600 sm:text-[30px]">
            {mustChoose ? "-" : displayPrice}
          </span>
          {!mustChoose && showStrike ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(listAmount)}
            </span>
          ) : null}
        </div>
      </div>

      {useOptionAxes ? (
        <div className="space-y-4">
          {optionAxes.map((axis) => (
            <div key={axis.attributeId} className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">{axis.name}</h2>
              <div className="flex flex-wrap gap-2">
                {axis.values.map((value) => {
                  const isSelected = selectedOptions[axis.attributeId] === value.valueId;
                  return (
                    <button
                      key={value.valueId}
                      type="button"
                      onClick={() => {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [axis.attributeId]: value.valueId,
                        }));
                        setQuantity(1);
                        setError(null);
                      }}
                      className={cn(
                        "rounded-[8px] border px-4 py-2 text-sm transition-colors duration-150",
                        isSelected
                          ? "border-primary bg-primary/5 font-medium text-primary"
                          : "border-border bg-secondary/50 text-foreground hover:border-primary/50",
                      )}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : activeVariants.length > 1 ? (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="w-20 shrink-0 text-muted-foreground">Phân loại</span>
            <span className="font-medium text-foreground">
              {selected?.name || selected?.sku}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((variant) => {
              const label = variant.name || variant.sku;
              const selectedVariant = variant.id === selected?.id;
              const disabled =
                variant.status === "OUT_OF_STOCK" || variant.stock <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedId(variant.id);
                    setQuantity(1);
                    setError(null);
                  }}
                  className={cn(
                    "rounded-[8px] border px-3 py-1.5 text-sm transition-colors duration-150",
                    selectedVariant
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {mustChoose ? (
        <p className="text-sm text-destructive">
          Không tìm thấy biến thể phù hợp với lựa chọn hiện tại.
        </p>
      ) : (
        <div className="flex items-baseline gap-2 text-sm">
          <span className="w-20 shrink-0 text-muted-foreground">Kho</span>
          <span className="text-foreground">
            {outOfStock ? "Hết hàng" : `Còn lại: ${selected?.stock ?? 0} sản phẩm`}
            {selected?.sku ? (
              <span className="text-muted-foreground"> · SKU {selected.sku}</span>
            ) : null}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <span className="w-20 shrink-0 text-muted-foreground">Số lượng</span>
        <div className="inline-flex items-center rounded-[8px] border border-border">
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={!canPurchase || quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Minus className="size-3.5" aria-hidden />
          </button>
          <span className="min-w-10 px-2 text-center font-medium tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={!canPurchase || quantity >= maxQty}
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Plus className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="sm:min-w-[160px]"
          disabled={!canPurchase}
          onClick={onAddToCart}
        >
          <ShoppingCart className="size-4" aria-hidden />
          {outOfStock
            ? "Hết hàng"
            : noPrice
              ? "Chưa có giá"
              : justAdded
                ? "Đã thêm!"
                : "Thêm vào giỏ"}
        </Button>
        {noPrice && !outOfStock && !mustChoose ? (
          <Button asChild className="sm:min-w-[160px]">
            <a href={sitePhoneTelHref()}>Liên hệ mua</a>
          </Button>
        ) : (
          <Button
            type="button"
            className="sm:min-w-[160px]"
            disabled={!canPurchase}
            onClick={onBuyNow}
          >
            {outOfStock ? "Không khả dụng" : "Mua ngay"}
          </Button>
        )}
      </div>

      {noPrice && !mustChoose ? (
        <p className="text-xs text-muted-foreground">
          Chưa có giá bán.{" "}
          <a href={sitePhoneTelHref()} className="font-medium text-primary hover:underline">
            Liên hệ {SITE_CONFIG.phone}
          </a>
        </p>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {justAdded ? (
        <p className="text-xs text-primary">
          Đã thêm vào giỏ.{" "}
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => router.push("/cart")}
          >
            Xem giỏ hàng
          </button>
        </p>
      ) : null}
    </div>
  );
};

export default VariantPurchaseCard;
