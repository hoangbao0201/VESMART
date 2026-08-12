"use client";

import { useEffect, useState } from "react";
import type { MarkdownHeading } from "@/lib/markdown";
import { cn } from "@/lib/utils/cn";

type MarkdownTocProps = {
  headings: MarkdownHeading[];
  className?: string;
};

const MarkdownToc = ({ headings, className }: MarkdownTocProps) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const nav = (
    <nav aria-label="Mục lục bài viết">
      <ul>
        {headings.map((heading) => (
          <li key={heading.id} className={`level-${heading.level}`}>
            <a
              href={`#${heading.id}`}
              className={cn(activeId === heading.id && "is-active")}
              onClick={(event) => {
                event.preventDefault();
                const el = document.getElementById(heading.id);
                if (!el) return;
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${heading.id}`);
                setActiveId(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <aside className={cn("vesmart-md-toc", className)}>
      {/* Desktop sticky title */}
      <p className="vesmart-md-toc-title hidden lg:block">Mục lục</p>
      <div className="hidden lg:block">{nav}</div>

      {/* Mobile collapsible */}
      <details className="lg:hidden">
        <summary>Mục lục ({headings.length})</summary>
        <div className="vesmart-md-toc-panel">{nav}</div>
      </details>
    </aside>
  );
};

export default MarkdownToc;
