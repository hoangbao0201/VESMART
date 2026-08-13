"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toCdnFullUrl } from "@/lib/media/cdn-image";

type MarkdownEnhancerProps = {
  rootId: string;
};

/**
 * Progressive enhancements for rendered markdown:
 * copy buttons, image lightbox (full CDN WebP, not resize:500).
 */
const MarkdownEnhancer = ({ rootId }: MarkdownEnhancerProps) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const copyBtn = target.closest<HTMLButtonElement>("[data-md-copy]");
      if (copyBtn) {
        const block = copyBtn.closest(".md-code-block");
        const code = block?.querySelector("pre code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          const prev = copyBtn.textContent;
          copyBtn.textContent = "Đã sao chép";
          window.setTimeout(() => {
            copyBtn.textContent = prev || "Sao chép";
          }, 1600);
        } catch {
          copyBtn.textContent = "Lỗi";
        }
        return;
      }

      const img = target.closest<HTMLImageElement>("img.md-image, .md-figure img");
      if (img?.src) {
        event.preventDefault();
        const full =
          img.getAttribute("data-full-src") || toCdnFullUrl(img.currentSrc || img.src);
        setLightboxSrc(full);
        setLightboxAlt(img.alt || "");
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [rootId]);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxSrc(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxSrc]);

  if (!lightboxSrc || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="vesmart-md-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      onClick={() => setLightboxSrc(null)}
    >
      <button
        type="button"
        className="vesmart-md-lightbox-close"
        aria-label="Đóng"
        onClick={() => setLightboxSrc(null)}
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lightboxSrc}
        alt={lightboxAlt}
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  );
};

export default MarkdownEnhancer;
