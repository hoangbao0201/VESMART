"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import type { MediaImage, MediaImageCategory } from "@/types/media";
import type { PaginationMeta } from "@/types/api";
import { toCdnDisplayUrl, toCdnFullUrl } from "@/lib/media/cdn-image";

type ImagesGalleryProps = {
  images: MediaImage[];
  meta: PaginationMeta;
  categories: MediaImageCategory[];
  activeCategoryId?: number;
  page: number;
};

function flattenChildren(tree: MediaImageCategory[]): MediaImageCategory[] {
  const out: MediaImageCategory[] = [];
  for (const parent of tree) {
    for (const child of parent.children ?? []) {
      out.push({
        ...child,
        name: `${parent.name} / ${child.name}`,
      });
    }
  }
  return out;
}

function buildHref(params: { categoryId?: number; page?: number }) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("category", String(params.categoryId));
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return qs ? `/images?${qs}` : "/images";
}

const ImagesGallery = ({
  images,
  meta,
  categories,
  activeCategoryId,
  page,
}: ImagesGalleryProps) => {
  const [selected, setSelected] = useState<MediaImage | null>(null);
  const filters = useMemo(() => flattenChildren(categories), [categories]);

  return (
    <div className="space-y-6">
      {filters.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/images"
            className={cn(
              "rounded-[12px] border px-3 py-1.5 text-sm font-medium transition-colors",
              !activeCategoryId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            Tất cả
          </Link>
          {filters.map((cat) => (
            <Link
              key={cat.id}
              href={buildHref({ categoryId: cat.id })}
              className={cn(
                "rounded-[12px] border px-3 py-1.5 text-sm font-medium transition-colors",
                activeCategoryId === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      ) : null}

      {images.length === 0 ? (
        <EmptyState
          title="Chưa có ảnh"
          description="Kho ảnh sẽ hiển thị khi có dữ liệu trên CDN."
        />
      ) : (
        <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
          {images.map((image) => {
            const hasAspect =
              image.width != null &&
              image.height != null &&
              image.width > 0 &&
              image.height > 0;

            return (
              <li key={image.id} className="mb-3 break-inside-avoid">
                <button
                  type="button"
                  className="group relative block w-full overflow-hidden rounded-[12px] border border-border bg-secondary text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  style={
                    hasAspect
                      ? { aspectRatio: `${image.width} / ${image.height}` }
                      : undefined
                  }
                  onClick={() => setSelected(image)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- variable aspect masonry */}
                  <img
                    src={toCdnDisplayUrl(image.url)}
                    alt={image.description || "Ảnh VESMART"}
                    loading="lazy"
                    width={image.width ?? undefined}
                    height={image.height ?? undefined}
                    className={cn(
                      "w-full transition duration-200 group-hover:scale-[1.02]",
                      hasAspect ? "h-full object-cover" : "h-auto",
                    )}
                  />
                  {image.description ? (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {image.description}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        buildHref={(nextPage) =>
          buildHref({ categoryId: activeCategoryId, page: nextPage })
        }
      />

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          title={selected?.description || "Xem ảnh"}
          className="w-[min(960px,calc(100%-1.5rem))] p-3 sm:p-4"
        >
          {selected ? (
            <div className="relative mx-auto max-h-[75vh] w-full overflow-hidden rounded-[12px] bg-secondary">
              <Image
                src={toCdnFullUrl(selected.url)}
                alt={selected.description || "Ảnh VESMART"}
                width={selected.width || 1200}
                height={selected.height || 1200}
                className="mx-auto h-auto max-h-[75vh] w-auto object-contain"
                unoptimized
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImagesGallery;
