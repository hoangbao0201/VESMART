import MarkdownIt from "markdown-it";
import { toCdnDisplayUrl, toCdnFullUrl } from "@/lib/media/cdn-image";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Lightweight markdown for product descriptions - no highlight.js. */
function createLiteMarkdownParser() {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight(code) {
      return escapeHtml(code);
    },
  });

  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = String(token.attrGet("href") || "");
    token.attrJoin("class", "md-link");
    if (/^https?:\/\//i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
      token.attrJoin("class", "md-link-external");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const alt = String(token.content || token.attrGet("alt") || "");
    const src = String(token.attrGet("src") || "");
    const display = toCdnDisplayUrl(src);
    const full = toCdnFullUrl(src);
    return `<figure class="md-figure"><img src="${escapeHtml(display)}" data-full-src="${escapeHtml(
      full,
    )}" alt="${escapeHtml(
      alt,
    )}" loading="lazy" decoding="async" class="md-image" /></figure>`;
  };

  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const code = escapeHtml(token.content.replace(/\n$/, ""));
    return `<pre class="hljs"><code>${code}</code></pre>\n`;
  };

  return md;
}

const liteParser = createLiteMarkdownParser();

export function renderMarkdownLite(source: string): string {
  return liteParser.render(source ?? "");
}
