import { SITE_CONFIG } from "@/configs/site.config";
import {
  absoluteUrl,
  buildOfferShippingAndReturnPolicy,
  productPath,
  toPlainText,
} from "@/lib/seo";
import { effectiveUnitPrice } from "@/lib/product/pricing";
import type { ProductDetail } from "@/types/product";

export function productJsonLd(product: ProductDetail): Record<string, unknown> {
  const { shippingDetails, hasMerchantReturnPolicy } =
    buildOfferShippingAndReturnPolicy();

  const activeVariants = (product.variants ?? []).filter(
    (v) => v.status !== "INACTIVE",
  );
  const prices = activeVariants
    .map((v) => effectiveUnitPrice(v.salePrice, v.price))
    .filter((p): p is number => p !== null && p > 0);
  const lowPrice = prices.length ? Math.min(...prices) : null;
  const highPrice = prices.length ? Math.max(...prices) : null;
  const inStock = activeVariants.some((v) => v.stock > 0 && v.status === "ACTIVE");

  const images = [
    product.thumbnail,
    ...(product.images ?? []).map((img) => img.imageUrl),
  ].filter((url): url is string => Boolean(url));

  const availability = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  let offers: Record<string, unknown>;

  if (lowPrice !== null && highPrice !== null && highPrice !== lowPrice) {
    offers = {
      "@type": "AggregateOffer",
      url: absoluteUrl(productPath(product.slug)),
      priceCurrency: SITE_CONFIG.currency,
      lowPrice: String(lowPrice),
      highPrice: String(highPrice),
      offerCount: String(prices.length),
      availability,
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
      shippingDetails,
      hasMerchantReturnPolicy,
    };
  } else {
    offers = {
      "@type": "Offer",
      url: absoluteUrl(productPath(product.slug)),
      priceCurrency: SITE_CONFIG.currency,
      availability,
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
      shippingDetails,
      hasMerchantReturnPolicy,
    };
    if (lowPrice !== null) {
      offers.price = String(lowPrice);
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      toPlainText(product.seoDescription || product.shortDescription || product.description, 300) ||
      product.name,
    sku: product.sku,
    image: images.length ? images.map((url) => absoluteUrl(url)) : undefined,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    category: product.category?.name,
    url: absoluteUrl(productPath(product.slug)),
    offers,
  };
}
