import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("jsx", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);

export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

/** Trailing numeric entity id in public slugs: `{base}-{id}`. */
const NUMERIC_ID_SUFFIX_RE = /-(\d+)$/;

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 220);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseFenceInfo(info: string): { lang: string; title: string | null } {
  const raw = (info || "").trim();
  if (!raw) return { lang: "plaintext", title: null };

  // ```ts:app.ts  or  ```ts title="app.ts"  or  ```ts app.ts
  const titled = raw.match(/^([\w#+-]+)(?:\s+title="([^"]+)"|\s+(.+)|:([^\s]+))?$/i);
  if (!titled) return { lang: raw.split(/\s+/)[0] || "plaintext", title: null };

  const lang = titled[1] || "plaintext";
  const title = titled[2] || titled[3] || titled[4] || null;
  return { lang, title: title?.trim() || null };
}

function highlightCode(code: string, lang: string): string {
  const normalized = lang.toLowerCase();
  try {
    if (normalized && hljs.getLanguage(normalized)) {
      return hljs.highlight(code, { language: normalized, ignoreIllegals: true }).value;
    }
  } catch {
    // fall through
  }
  return escapeHtml(code);
}

/** Task list: `- [ ]` / `- [x]` inside list items. */
function taskListPlugin(md: InstanceType<typeof MarkdownIt>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  md.core.ruler.after("inline", "vesmart-task-lists", (state: any) => {
    const tokens = state.tokens as Array<{
      type: string;
      content: string;
      children: Array<{ type: string; content: string }> | null;
      attrJoin: (name: string, value: string) => void;
    }>;

    for (let idx = 0; idx < tokens.length; idx += 1) {
      const token = tokens[idx];
      if (token.type !== "inline" || !token.children) continue;
      const content = token.content;
      const match = content.match(/^\[([ xX])\]\s+/);
      if (!match) continue;

      const checked = match[1].toLowerCase() === "x";
      let li = idx - 1;
      while (li >= 0 && tokens[li].type !== "list_item_open") li -= 1;
      if (li < 0) continue;

      tokens[li].attrJoin("class", "task-list-item");
      if (checked) tokens[li].attrJoin("class", "is-checked");

      let ul = li - 1;
      while (ul >= 0 && tokens[ul].type !== "bullet_list_open") ul -= 1;
      if (ul >= 0) tokens[ul].attrJoin("class", "contains-task-list");

      const first = token.children[0];
      if (first?.type === "text") {
        first.content = first.content.replace(/^\[([ xX])\]\s+/, "");
      }
      token.content = content.replace(/^\[([ xX])\]\s+/, "");

      const checkbox = new state.Token("html_inline", "", 0);
      checkbox.content = `<input type="checkbox" class="task-list-item-checkbox" disabled ${
        checked ? "checked" : ""
      } />`;
      token.children.unshift(checkbox);
    }
  });
}

function createMarkdownParser() {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight(code, lang) {
      const { lang: language } = parseFenceInfo(lang || "");
      return highlightCode(code, language);
    },
  });

  md.use(markdownItAnchor, {
    level: [1, 2, 3, 4, 5, 6],
    slugify: (s: string) => slugifyTitle(s) || "section",
    permalink: markdownItAnchor.permalink.ariaHidden({
      symbol: "",
      placement: "before",
      class: "md-heading-anchor",
    }),
    tabIndex: false,
  });

  md.use(taskListPlugin);

  // External links + class
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

  // Images: lazy + class
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const alt = String(token.content || token.attrGet("alt") || "");
    const src = String(token.attrGet("src") || "");
    const title = token.attrGet("title");
    const caption = title ? `<figcaption>${escapeHtml(String(title))}</figcaption>` : "";
    return `<figure class="md-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(
      alt,
    )}" loading="lazy" decoding="async" class="md-image" />${caption}</figure>`;
  };

  // Code fence with toolbar + optional filename
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const { lang, title } = parseFenceInfo(token.info || "");
    const highlighted = highlightCode(token.content.replace(/\n$/, ""), lang);
    const label = title || lang;
    const titleHtml = label
      ? `<div class="md-code-title"><span>${escapeHtml(label)}</span></div>`
      : "";

    return `<div class="md-code-block" data-lang="${escapeHtml(lang)}">
      <div class="md-code-toolbar">
        ${titleHtml}
        <button type="button" class="md-code-copy" data-md-copy aria-label="Sao chép mã">
          Sao chép
        </button>
      </div>
      <pre class="hljs"><code class="language-${escapeHtml(lang)}">${highlighted}</code></pre>
    </div>\n`;
  };

  // Tables wrapper for overflow
  const defaultTableOpen =
    md.renderer.rules.table_open ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  const defaultTableClose =
    md.renderer.rules.table_close ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.table_open = (tokens, idx, options, env, self) =>
    `<div class="md-table-wrap">${defaultTableOpen(tokens, idx, options, env, self)}`;
  md.renderer.rules.table_close = (tokens, idx, options, env, self) =>
    `${defaultTableClose(tokens, idx, options, env, self)}</div>\n`;

  return md;
}

/** Shared markdown parser - linkify + typographer for readable public content. */
export const mdParser = createMarkdownParser();

export function renderMarkdown(source: string): string {
  return mdParser.render(source ?? "");
}

function tokenText(token: { content?: string; children?: Array<{ content?: string }> | null }): string {
  if (token.children?.length) {
    return token.children.map((child) => child.content || "").join("");
  }
  return token.content || "";
}

/** Extract H2–H4 for TOC (from markdown source). */
export function extractMarkdownHeadings(source: string): MarkdownHeading[] {
  if (!source?.trim()) return [];
  const tokens = mdParser.parse(source, {});
  const headings: MarkdownHeading[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    const level = Number(token.tag.slice(1));
    if (level < 2 || level > 4) continue;
    const inline = tokens[i + 1];
    const text = inline ? tokenText(inline).trim() : "";
    if (!text) continue;

    const baseId = String(token.attrGet("id") || slugifyTitle(text) || "section");
    const count = seen.get(baseId) ?? 0;
    const id = count > 0 ? `${baseId}-${count + 1}` : baseId;
    seen.set(baseId, count + 1);

    headings.push({ id, text, level: level as 2 | 3 | 4 });
  }

  return headings;
}

export function looksLikeHtml(source: string): boolean {
  const trimmed = source.trim();
  return /^<(p|div|h[1-6]|ul|ol|table|article|section)\b/i.test(trimmed);
}

/** Form field shows base slug; public URL is `{base}-{id}` (posts/products/threads). */
export function stripIdFromSlug(slug: string, id?: string | number): string {
  if (!slug) return "";
  if (id != null && id !== "") {
    const suffix = `-${id}`;
    if (slug.endsWith(suffix)) {
      return slug.slice(0, -suffix.length);
    }
  }
  return slug.replace(NUMERIC_ID_SUFFIX_RE, "");
}

/** @deprecated Prefer stripIdFromSlug - kept for existing imports. */
export const stripPostIdFromSlug = stripIdFromSlug;

export function buildPublicSlug(baseSlug: string, id?: string | number | null): string {
  const base = stripIdFromSlug(baseSlug, id ?? undefined) || "slug-bai-viet";
  return id != null && id !== "" ? `${base}-${id}` : `${base}-{id}`;
}

/** @deprecated Prefer buildPublicSlug - kept for existing imports. */
export const buildPostPublicSlug = buildPublicSlug;
