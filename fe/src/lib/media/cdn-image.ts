const RESIZE_RE = /-resize:(?:500|1000)\.webp$/i;

function isVesmartCdn(url: string): boolean {
  try {
    return new URL(url).hostname === "cdn.vesmart.vn";
  } catch {
    return /cdn\.vesmart\.vn/i.test(url);
  }
}

/** Strip resize suffix → canonical full `.webp` (or leave non-CDN alone). */
export function toCdnFullUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!isVesmartCdn(url)) return url;
  let out = url.replace(RESIZE_RE, ".webp");
  out = out.replace(/\.(jpe?g|png|gif)$/i, ".webp");
  return out;
}

/**
 * Display URL for lists/cards/inline markdown: `*-resize:500.webp`.
 * Non-CDN URLs unchanged.
 */
export function toCdnDisplayUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!isVesmartCdn(url)) return url;
  const full = toCdnFullUrl(url);
  if (RESIZE_RE.test(url) && /-resize:500\.webp$/i.test(url)) return url;
  return full.replace(/\.webp$/i, "-resize:500.webp");
}

/** Optional mid size (not used in UI yet). */
export function toCdnResize1000Url(url: string | null | undefined): string {
  if (!url) return "";
  if (!isVesmartCdn(url)) return url;
  const full = toCdnFullUrl(url);
  return full.replace(/\.webp$/i, "-resize:1000.webp");
}

/** Rewrite CDN image src attributes inside HTML (markdown output). */
export function rewriteHtmlCdnImagesToDisplay(html: string): string {
  if (!html || !html.includes("cdn.vesmart.vn")) return html;
  return html.replace(
    /<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (_m, pre: string, src: string, post: string) => {
      if (!isVesmartCdn(src)) {
        return `<img${pre}src="${src}"${post}>`;
      }
      const display = toCdnDisplayUrl(src);
      const full = toCdnFullUrl(src);
      const withoutFull = `${pre}${post}`.replace(
        /\s*data-full-src=["'][^"']*["']/i,
        "",
      );
      return `<img${withoutFull} src="${display}" data-full-src="${full}">`;
    },
  );
}
