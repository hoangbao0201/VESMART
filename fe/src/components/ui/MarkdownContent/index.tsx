import {
  extractMarkdownHeadings,
  looksLikeHtml,
  renderMarkdown,
  slugifyTitle,
  type MarkdownHeading,
} from "@/lib/markdown";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { rewriteHtmlCdnImagesToDisplay } from "@/lib/media/cdn-image";
import { cn } from "@/lib/utils/cn";
import MarkdownToc from "./MarkdownToc";
import MarkdownEnhancer from "./MarkdownEnhancer";
import "./markdown-content.css";

type MarkdownContentProps = {
  content: string;
  className?: string;
  /** Show sticky TOC from H2–H4 (markdown sources only). */
  showToc?: boolean;
  /** Wrap body in semantic article. Default true. */
  asArticle?: boolean;
  /**
   * `lite` skips highlight.js + client enhancer (product descriptions).
   * `full` is for blog/forum articles.
   */
  mode?: "full" | "lite";
};

/** Server-safe markdown → HTML for public article body. Legacy HTML content is passed through. */
const MarkdownContent = ({
  content,
  className,
  showToc = false,
  asArticle = true,
  mode = "full",
}: MarkdownContentProps) => {
  const isHtml = looksLikeHtml(content);
  const rawHtml = isHtml
    ? content
    : mode === "lite"
      ? renderMarkdownLite(content)
      : renderMarkdown(content);
  const html = isHtml ? rewriteHtmlCdnImagesToDisplay(rawHtml) : rawHtml;
  const headings: MarkdownHeading[] =
    !isHtml && showToc && mode === "full" ? extractMarkdownHeadings(content) : [];
  const hasToc = headings.length >= 2;
  const contentId = `vesmart-md-${slugifyTitle(content.slice(0, 40)) || "body"}-${content.length}`;
  const enhance = mode === "full";

  const body = (
    <div
      id={contentId}
      className={cn("vesmart-md-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  const wrapped = asArticle ? (
    <article className="min-w-0 max-w-full">{body}</article>
  ) : (
    <div className="min-w-0 max-w-full">{body}</div>
  );

  return (
    <div className={cn("vesmart-md-layout min-w-0 max-w-full", hasToc && "has-toc")}>
      {wrapped}
      {hasToc ? <MarkdownToc headings={headings} /> : null}
      {enhance ? <MarkdownEnhancer rootId={contentId} /> : null}
    </div>
  );
};

export default MarkdownContent;
