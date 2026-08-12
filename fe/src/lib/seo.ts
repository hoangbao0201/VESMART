import { SITE_CONFIG } from "@/configs/site.config";

/** Prefer NEXT_PUBLIC_SITE_URL (staging/prod) for canonical, sitemap, JSON-LD. */
export function getPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_CONFIG.url).replace(/\/$/, "");
}

export function absoluteUrl(pathOrUrl: string): string {
  const base = getPublicSiteUrl();
  if (!pathOrUrl) return base;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export function productPath(slug: string): string {
  return `/products/${slug}`;
}

export function postPath(slug: string): string {
  return `/blog/${slug}`;
}

export function forumPath(slug: string): string {
  return `/forum/${slug}`;
}

export function threadPath(slug: string): string {
  return `/forum/threads/${slug}`;
}

export function tagPath(slug: string): string {
  return `/blog?tag=${encodeURIComponent(slug)}`;
}

/** Plain text for meta / JSON-LD from HTML or markdown-ish content. */
export function toPlainText(raw: string | null | undefined, maxLen = 160): string {
  if (!raw) return "";
  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trim()}…`;
}

/** Matches root layout title template `%s · VESMART`. */
export function buildPageTitle(pageTitle: string): string {
  const t = pageTitle.trim();
  if (!t) return SITE_CONFIG.name;
  if (t.toLowerCase().includes(SITE_CONFIG.name.toLowerCase())) return t;
  return `${t} · ${SITE_CONFIG.name}`;
}

export type BreadcrumbItem = { name: string; path?: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  const list = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    ...(item.path ? { item: absoluteUrl(item.path) } : {}),
  }));
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list,
  };
}

export function itemListJsonLd(
  name: string,
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function asJsonLdGraph(
  nodes: Array<Record<string, unknown>>,
): Record<string, unknown> {
  if (nodes.length === 1) return nodes[0];
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map(({ "@context": _c, ...rest }) => rest),
  };
}

export function buildOfferShippingAndReturnPolicy(): {
  shippingDetails: Record<string, unknown>;
  hasMerchantReturnPolicy: Record<string, unknown>;
} {
  const m = SITE_CONFIG.merchant;
  return {
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: String(m.shipping.rateValueVnd),
        currency: SITE_CONFIG.currency,
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: m.shipping.destinationCountry,
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: m.shipping.handlingDaysMin,
          maxValue: m.shipping.handlingDaysMax,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: m.shipping.transitDaysMin,
          maxValue: m.shipping.transitDaysMax,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: m.returns.applicableCountry,
      returnPolicyCategory: m.returns.returnPolicyCategory,
      merchantReturnDays: m.returns.merchantReturnDays,
      returnMethod: m.returns.returnMethod,
      returnFees: m.returns.returnFees,
      ...(m.returns.policyPageUrl ? { url: m.returns.policyPageUrl } : {}),
    },
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getPublicSiteUrl()}/#organization`,
    name: SITE_CONFIG.name,
    url: getPublicSiteUrl(),
    logo: absoluteUrl(SITE_CONFIG.logo),
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    sameAs: [...SITE_CONFIG.sameAs],
  };
}

export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${getPublicSiteUrl()}/#localbusiness`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: getPublicSiteUrl(),
    image: absoluteUrl(SITE_CONFIG.logo),
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address,
      addressLocality: "Đà Nẵng",
      addressCountry: "VN",
    },
    sameAs: [...SITE_CONFIG.sameAs],
    priceRange: "$$",
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getPublicSiteUrl()}/#website`,
    name: SITE_CONFIG.name,
    url: getPublicSiteUrl(),
    description: SITE_CONFIG.description,
    inLanguage: "vi-VN",
    publisher: { "@id": `${getPublicSiteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getPublicSiteUrl()}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
