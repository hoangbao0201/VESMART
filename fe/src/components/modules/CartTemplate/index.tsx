"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Minus, Phone, Plus, Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { getProductBySlug } from "@/lib/api/products";
import {
  effectiveUnitPrice,
  formatMoneyOrContact,
  lineTotal,
  moneyToString,
  parseMoney,
} from "@/lib/product/pricing";
import { formatPrice } from "@/lib/utils/format";
import { SITE_CONFIG, sitePhoneTelHref } from "@/configs/site.config";
import type { CartItemPricePatch } from "@/types/cart";

const CartTemplate = () => {
  const {
    items,
    hydrated,
    itemCount,
    subtotal,
    hasPricedItems,
    setQuantity,
    removeItem,
    clear,
    updateItemPrices,
  } = useCart();
  const [syncing, setSyncing] = useState(false);
  const syncedKeyRef = useRef<string>("");

  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    const key = items
      .map((i) => `${i.variantId}:${i.productSlug}`)
      .sort()
      .join("|");
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;

    let cancelled = false;
    setSyncing(true);

    void (async () => {
      const slugs = [...new Set(items.map((i) => i.productSlug))];
      const products = await Promise.all(
        slugs.map((slug) => getProductBySlug(slug)),
      );
      if (cancelled) return;

      const patches: CartItemPricePatch[] = [];
      for (const item of items) {
        const product = products.find((p) => p?.slug === item.productSlug) ?? null;
        if (!product) continue;
        const variant = product.variants?.find((v) => v.id === item.variantId);
        if (!variant) continue;

        const unit = effectiveUnitPrice(variant.salePrice, variant.price);
        const list = parseMoney(variant.price);
        patches.push({
          variantId: item.variantId,
          unitPrice: moneyToString(unit) ?? "",
          listPrice: moneyToString(list !== null && list > 0 ? list : unit) ?? "",
          stock: variant.stock,
          productName: product.name,
          productSlug: product.slug,
          thumbnail: variant.image ?? product.thumbnail,
          variantName: variant.name,
          sku: variant.sku,
        });
      }

      if (!cancelled && patches.length > 0) {
        updateItemPrices(patches);
      }
      if (!cancelled) setSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, items, updateItemPrices]);

  if (!hydrated) {
    return (
      <Container className="py-8 sm:py-10">
        <p className="text-sm text-muted-foreground">Đang tải giỏ hàng…</p>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Giỏ hàng" },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Giỏ hàng</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {itemCount > 0
              ? `${itemCount} sản phẩm trong giỏ${syncing ? " · đang cập nhật giá…" : ""}`
              : "Chưa có sản phẩm nào"}
          </p>
        </div>
        {items.length > 0 ? (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Xóa tất cả
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Giỏ hàng trống"
          description="Thêm sản phẩm từ trang chi tiết để tiếp tục mua sắm."
          action={
            <Button asChild>
              <Link href="/products">Xem sản phẩm</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <ul className="divide-y divide-border rounded-[12px] border border-border bg-card">
            {items.map((item) => {
              const unitAmount = parseMoney(item.unitPrice);
              const listAmount = parseMoney(item.listPrice);
              const unitLabel = formatMoneyOrContact(item.unitPrice);
              const totalAmount = lineTotal(item.unitPrice, item.quantity);
              const totalLabel =
                totalAmount !== null
                  ? (formatPrice(totalAmount) ?? "Liên hệ")
                  : "Liên hệ";
              const showStrike =
                unitAmount !== null &&
                listAmount !== null &&
                listAmount > unitAmount;

              return (
                <li key={item.variantId} className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-[8px] bg-secondary sm:size-24"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary sm:text-base"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName ? (
                          <p className="text-xs text-muted-foreground">
                            Phân loại: {item.variantName}
                          </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">SKU {item.sku}</p>
                      </div>
                      <button
                        type="button"
                        aria-label="Xóa khỏi giỏ"
                        onClick={() => removeItem(item.variantId)}
                        className="rounded-[8px] p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-primary sm:text-base">
                          {unitLabel}
                        </span>
                        {showStrike ? (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(listAmount)}
                          </span>
                        ) : null}
                      </div>

                      <div className="inline-flex items-center rounded-[8px] border border-border">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          disabled={item.quantity <= 1}
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          className="flex size-8 items-center justify-center hover:bg-secondary disabled:opacity-40"
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </button>
                        <span className="min-w-8 px-1 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          disabled={item.stock > 0 && item.quantity >= item.stock}
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          className="flex size-8 items-center justify-center hover:bg-secondary disabled:opacity-40"
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </div>

                      <span className="min-w-[5.5rem] text-right text-sm font-semibold tabular-nums text-foreground">
                        {totalLabel}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="space-y-4 rounded-[12px] border border-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="text-base font-semibold">Tóm tắt đơn hàng</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính ({itemCount} SP)</span>
              <span className="font-semibold tabular-nums">
                {hasPricedItems ? formatMoneyOrContact(subtotal) : "Liên hệ"}
              </span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-lg font-semibold text-primary tabular-nums">
                  {hasPricedItems ? formatMoneyOrContact(subtotal) : "Liên hệ"}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Đặt hàng nhanh</p>
              <Button asChild className="w-full">
                <a href={sitePhoneTelHref()}>
                  <Phone className="size-4" aria-hidden />
                  Gọi {SITE_CONFIG.phone}
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href={SITE_CONFIG.facebook} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  Nhắn Facebook
                </a>
              </Button>
            </div>

            <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
              <p>
                Email:{" "}
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-foreground hover:text-primary"
                >
                  {SITE_CONFIG.email}
                </a>
              </p>
              <p>{SITE_CONFIG.address}</p>
            </div>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/products">Tiếp tục mua sắm</Link>
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
};

export default CartTemplate;
