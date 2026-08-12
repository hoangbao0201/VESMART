"use client";

import { useMemo, useState } from "react";
import type { CategoryListItem } from "@/lib/api/categories";
import { fieldClass, labelClass } from "./fieldStyles";

type CategorySelectorProps = {
  options: Array<CategoryListItem & { label: string }>;
  value: number;
  onChange: (id: number) => void;
  error?: string;
  disabled?: boolean;
};

const CategorySelector = ({
  options,
  value,
  onChange,
  error,
  disabled,
}: CategorySelectorProps) => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>Danh mục *</span>
      <input
        className={fieldClass}
        placeholder="Tìm danh mục…"
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        className={fieldClass}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="">Chọn danh mục</option>
        {filtered.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
};

export default CategorySelector;
