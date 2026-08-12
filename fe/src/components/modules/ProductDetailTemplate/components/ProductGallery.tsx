"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils/cn";

type ProductGalleryProps = {
  name: string;
  thumbnail: string | null;
  images: ProductImage[];
};

/** Stable aspect-square gallery (no Swiper) - better LCP/CLS on mobile. */
const ProductGallery = ({ name, thumbnail, images }: ProductGalleryProps) => {
  const gallery = useMemo(() => {
    if (images.length > 0) {
      return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    if (thumbnail) {
      return [{ id: 0, imageUrl: thumbnail, altText: name, sortOrder: 0 }];
    }
    return [];
  }, [images, thumbnail, name]);

  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[12px] border border-border bg-secondary text-sm text-muted-foreground">
        Chưa có ảnh
      </div>
    );
  }

  const active = gallery[Math.min(activeIndex, gallery.length - 1)];
  const go = (next: number) => {
    const len = gallery.length;
    setActiveIndex(((next % len) + len) % len);
  };

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden border border-border bg-secondary">
        <Image
          src={active.imageUrl}
          alt={active.altText || `${name} - ảnh ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 450px"
        />

        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(activeIndex - 1)}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(activeIndex + 1)}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-medium text-background">
              {activeIndex + 1}/{gallery.length}
            </div>
          </>
        ) : null}
      </div>

      {gallery.length > 1 ? (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {gallery.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden border-2 bg-secondary transition-colors duration-150",
                index === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-primary/40",
              )}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <Image
                src={image.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ProductGallery;
