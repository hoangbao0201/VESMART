export type CartItem = {
  productId: number;
  productSlug: string;
  productName: string;
  thumbnail: string | null;
  variantId: number;
  variantName: string | null;
  sku: string;
  /** Effective unit price as decimal string. Empty when unknown / contact-only. */
  unitPrice: string;
  /** List price for strikethrough display. */
  listPrice: string;
  quantity: number;
  /** Stock snapshot when last added/updated. */
  stock: number;
};

export type AddToCartInput = {
  productId: number;
  productSlug: string;
  productName: string;
  thumbnail: string | null;
  variantId: number;
  variantName: string | null;
  sku: string;
  /** Raw sale / list from product variant - normalized inside addItem. */
  salePrice?: string | number | null;
  listPrice?: string | number | null;
  /** Pre-resolved unit (optional). Prefer salePrice + listPrice. */
  unitPrice?: string | number | null;
  quantity?: number;
  stock: number;
};

export type CartItemPricePatch = {
  variantId: number;
  unitPrice?: string;
  listPrice?: string;
  stock?: number;
  productName?: string;
  productSlug?: string;
  thumbnail?: string | null;
  variantName?: string | null;
  sku?: string;
};
