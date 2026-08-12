"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  effectiveUnitPrice,
  moneyToString,
  parseMoney,
} from "@/lib/product/pricing";
import type { AddToCartInput, CartItem, CartItemPricePatch } from "@/types/cart";

const STORAGE_KEY = "vesmart.cart.v2";

type CartContextValue = {
  items: CartItem[];
  /** False until localStorage has been read (avoids hydration flicker). */
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  hasPricedItems: boolean;
  addItem: (input: AddToCartInput) => boolean;
  setQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clear: () => void;
  updateItemPrices: (patches: CartItemPricePatch[]) => void;
  replaceItems: (next: CartItem[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as CartItem;
  return (
    typeof item.variantId === "number" &&
    typeof item.productId === "number" &&
    typeof item.productSlug === "string" &&
    typeof item.productName === "string" &&
    typeof item.quantity === "number" &&
    typeof item.sku === "string"
  );
}

function parseStoredItems(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).map((item) => ({
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      thumbnail: item.thumbnail ?? null,
      variantId: item.variantId,
      variantName: item.variantName ?? null,
      sku: item.sku,
      unitPrice: typeof item.unitPrice === "string" ? item.unitPrice : "",
      listPrice: typeof item.listPrice === "string" ? item.listPrice : "",
      quantity: Math.max(1, Math.floor(item.quantity) || 1),
      stock: typeof item.stock === "number" ? item.stock : 0,
    }));
  } catch {
    return [];
  }
}

function clampQuantity(quantity: number, stock: number): number {
  const max = Math.max(0, stock);
  if (max <= 0) return Math.max(1, Math.floor(quantity) || 1);
  return Math.min(Math.max(1, Math.floor(quantity)), max);
}

function resolvePrices(input: AddToCartInput): {
  unitPrice: string;
  listPrice: string;
} | null {
  const list =
    parseMoney(input.listPrice) ??
    parseMoney(input.unitPrice);
  const unit =
    effectiveUnitPrice(input.salePrice, input.listPrice) ??
    parseMoney(input.unitPrice);

  if (unit === null || unit <= 0) return null;

  return {
    unitPrice: moneyToString(unit)!,
    listPrice: moneyToString(list !== null && list > 0 ? list : unit)!,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(parseStoredItems(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((input: AddToCartInput): boolean => {
    const prices = resolvePrices(input);
    if (!prices) return false;

    const qty = input.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === input.variantId);
      if (existing) {
        const nextQty = clampQuantity(existing.quantity + qty, input.stock);
        return prev.map((item) =>
          item.variantId === input.variantId
            ? {
                ...item,
                quantity: nextQty,
                stock: input.stock,
                unitPrice: prices.unitPrice,
                listPrice: prices.listPrice,
                productName: input.productName,
                productSlug: input.productSlug,
                thumbnail: input.thumbnail,
                variantName: input.variantName,
                sku: input.sku,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: input.productId,
          productSlug: input.productSlug,
          productName: input.productName,
          thumbnail: input.thumbnail,
          variantId: input.variantId,
          variantName: input.variantName,
          sku: input.sku,
          unitPrice: prices.unitPrice,
          listPrice: prices.listPrice,
          quantity: clampQuantity(qty, input.stock),
          stock: input.stock,
        },
      ];
    });
    return true;
  }, []);

  const setQuantity = useCallback((variantId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.variantId !== variantId);
      }
      return prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: clampQuantity(quantity, item.stock) }
          : item,
      );
    });
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const updateItemPrices = useCallback((patches: CartItemPricePatch[]) => {
    if (patches.length === 0) return;
    const byId = new Map(patches.map((p) => [p.variantId, p]));
    setItems((prev) =>
      prev.map((item) => {
        const patch = byId.get(item.variantId);
        if (!patch) return item;
        return {
          ...item,
          unitPrice: patch.unitPrice ?? item.unitPrice,
          listPrice: patch.listPrice ?? item.listPrice,
          stock: patch.stock ?? item.stock,
          productName: patch.productName ?? item.productName,
          productSlug: patch.productSlug ?? item.productSlug,
          thumbnail: patch.thumbnail !== undefined ? patch.thumbnail : item.thumbnail,
          variantName:
            patch.variantName !== undefined ? patch.variantName : item.variantName,
          sku: patch.sku ?? item.sku,
          quantity: clampQuantity(item.quantity, patch.stock ?? item.stock),
        };
      }),
    );
  }, []);

  const replaceItems = useCallback((next: CartItem[]) => {
    setItems(next);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = parseMoney(item.unitPrice);
        if (price === null || price <= 0) return sum;
        return sum + price * item.quantity;
      }, 0),
    [items],
  );

  const hasPricedItems = useMemo(
    () => items.some((item) => {
      const price = parseMoney(item.unitPrice);
      return price !== null && price > 0;
    }),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      itemCount,
      subtotal,
      hasPricedItems,
      addItem,
      setQuantity,
      removeItem,
      clear,
      updateItemPrices,
      replaceItems,
    }),
    [
      items,
      hydrated,
      itemCount,
      subtotal,
      hasPricedItems,
      addItem,
      setQuantity,
      removeItem,
      clear,
      updateItemPrices,
      replaceItems,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
