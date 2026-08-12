"use client";

import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProductFormImage } from "@/lib/product/product-form-schema";
import { cardClass, fieldClass, labelClass } from "./fieldStyles";

type ProductImageUploaderProps = {
  images: ProductFormImage[];
  thumbnail: string;
  disabled?: boolean;
  error?: string;
  onReorder: (images: ProductFormImage[]) => void;
  onRemove: (clientId: string) => void;
  onSetThumbnail: (url: string) => void;
  onAddFiles: (files: FileList) => Promise<void>;
  onAddUrl: (url: string) => void;
};

const ProductImageUploader = ({
  images,
  thumbnail,
  disabled,
  error,
  onReorder,
  onRemove,
  onSetThumbnail,
  onAddFiles,
  onAddUrl,
}: ProductImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDropReorder = (toIndex: number) => {
    if (dragIndex == null || dragIndex === toIndex) return;
    const next = [...images];
    const [item] = next.splice(dragIndex, 1);
    next.splice(toIndex, 0, item);
    onReorder(next.map((img, index) => ({ ...img, sortOrder: index })));
    setDragIndex(null);
  };

  return (
    <section className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Hình ảnh</h2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (!e.target.files?.length) return;
            setUploadError(null);
            void onAddFiles(e.target.files).catch((err: Error) => {
              setUploadError(err.message || "Upload thất bại - hãy dán URL.");
            });
            e.target.value = "";
          }}
        />
      </div>

      <div
        className="flex min-h-28 flex-col items-center justify-center rounded-[12px] border border-dashed border-border bg-background px-4 py-6 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled || !e.dataTransfer.files.length) return;
          setUploadError(null);
          void onAddFiles(e.dataTransfer.files).catch((err: Error) => {
            setUploadError(err.message || "Upload thất bại - hãy dán URL.");
          });
        }}
      >
        <p className="text-sm text-muted-foreground">Kéo thả ảnh vào đây hoặc dùng Upload</p>
        <p className="mt-1 text-xs text-muted-foreground">PNG/JPG/WebP · tối đa 5MB</p>
      </div>

      <div className="flex gap-2">
        <input
          className={fieldClass}
          placeholder="Hoặc dán URL ảnh…"
          value={url}
          disabled={disabled}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || !url.trim()}
          onClick={() => {
            onAddUrl(url);
            setUrl("");
          }}
        >
          Thêm
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có ảnh sản phẩm.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => {
            const isThumb = thumbnail === image.imageUrl;
            return (
              <li
                key={image.clientId}
                draggable={!disabled}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropReorder(index)}
                className="overflow-hidden rounded-[12px] border border-border bg-background"
              >
                <div className="relative aspect-[4/3] bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.altText || "Product"}
                    className="size-full object-cover"
                  />
                  {image.uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                      {image.progress ?? 0}%
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <GripVertical className="size-3.5" />
                    #{index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={disabled}
                      title="Đặt làm thumbnail"
                      className={
                        isThumb
                          ? "rounded-[8px] bg-primary/15 p-1.5 text-primary"
                          : "rounded-[8px] p-1.5 text-muted-foreground hover:bg-secondary"
                      }
                      onClick={() => onSetThumbnail(image.imageUrl)}
                    >
                      <Star className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      className="rounded-[8px] p-1.5 text-destructive hover:bg-destructive/10"
                      onClick={() => onRemove(image.clientId)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {uploadError || error ? (
        <p className="text-xs text-destructive">{uploadError || error}</p>
      ) : (
        <p className={`${labelClass} text-xs font-normal text-muted-foreground`}>
          Ảnh gắn sao là thumbnail sản phẩm.
        </p>
      )}
    </section>
  );
};

export default ProductImageUploader;
