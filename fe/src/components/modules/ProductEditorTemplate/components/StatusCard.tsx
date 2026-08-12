"use client";

import type { ProductStatus } from "@/types/product";
import { cardClass, fieldClass, labelClass } from "./fieldStyles";

type StatusCardProps = {
  status: ProductStatus;
  featured: boolean;
  published: boolean;
  onStatusChange: (status: ProductStatus) => void;
  onFeaturedChange: (value: boolean) => void;
  onPublishedChange: (value: boolean) => void;
  disabled?: boolean;
};

const StatusCard = ({
  status,
  featured,
  published,
  onStatusChange,
  onFeaturedChange,
  onPublishedChange,
  disabled,
}: StatusCardProps) => {
  return (
    <section className={`${cardClass} space-y-4`}>
      <h2 className="text-sm font-semibold">Trạng thái</h2>
      <label className="block space-y-1.5">
        <span className={labelClass}>Status</span>
        <select
          className={fieldClass}
          value={status}
          disabled={disabled}
          onChange={(e) => onStatusChange(e.target.value as ProductStatus)}
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          disabled={disabled}
          onChange={(e) => onPublishedChange(e.target.checked)}
        />
        Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={featured}
          disabled={disabled}
          onChange={(e) => onFeaturedChange(e.target.checked)}
        />
        Featured
      </label>
    </section>
  );
};

export default StatusCard;
