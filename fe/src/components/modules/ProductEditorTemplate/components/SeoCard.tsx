"use client";

import { cardClass, fieldClass, labelClass } from "./fieldStyles";

type SeoCardProps = {
  seoTitle: string;
  seoDescription: string;
  titleFallback: string;
  slugPreview: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  disabled?: boolean;
};

const SeoCard = ({
  seoTitle,
  seoDescription,
  titleFallback,
  slugPreview,
  onSeoTitleChange,
  onSeoDescriptionChange,
  disabled,
}: SeoCardProps) => {
  const previewTitle = (seoTitle || titleFallback || "Tiêu đề sản phẩm").slice(0, 60);
  const previewDesc = (
    seoDescription || "Mô tả ngắn sẽ hiển thị trên kết quả tìm kiếm."
  ).slice(0, 160);

  return (
    <section className={`${cardClass} space-y-4`}>
      <h2 className="text-sm font-semibold">SEO</h2>
      <label className="block space-y-1.5">
        <span className={labelClass}>SEO title</span>
        <input
          className={fieldClass}
          value={seoTitle}
          disabled={disabled}
          maxLength={255}
          onChange={(e) => onSeoTitleChange(e.target.value)}
        />
      </label>
      <label className="block space-y-1.5">
        <span className={labelClass}>SEO description</span>
        <textarea
          className={`${fieldClass} h-24 py-2`}
          value={seoDescription}
          disabled={disabled}
          maxLength={500}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
        />
      </label>
      <div className="rounded-[12px] border border-border bg-background p-3">
        <p className="truncate text-base text-[#1a0dab] dark:text-sky-400">{previewTitle}</p>
        <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">
          /products/{slugPreview}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{previewDesc}</p>
      </div>
    </section>
  );
};

export default SeoCard;
