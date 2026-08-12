"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createTag } from "@/lib/api/tags";
import type { TagSummary } from "@/types/tag";
import { fieldClass, labelClass } from "./fieldStyles";

type TagSelectorProps = {
  tags: TagSummary[];
  value: number[];
  onChange: (ids: number[]) => void;
  onTagsChange: (tags: TagSummary[]) => void;
  disabled?: boolean;
};

const TagSelector = ({
  tags,
  value,
  onChange,
  onTagsChange,
  disabled,
}: TagSelectorProps) => {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, query]);

  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name || creating) return;
    setCreating(true);
    setError(null);
    try {
      const tag = await createTag({ name });
      onTagsChange([...tags, tag]);
      onChange([...value, tag.id]);
      setQuery("");
    } catch {
      setError("Không tạo được tag (cần ADMIN).");
    } finally {
      setCreating(false);
    }
  };

  const exactExists = tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <label className="block flex-1 space-y-1.5">
          <span className={labelClass}>Tags</span>
          <input
            className={fieldClass}
            placeholder="Tìm hoặc tạo tag…"
            value={query}
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {query.trim() && !exactExists ? (
          <Button type="button" size="sm" disabled={disabled || creating} onClick={() => void handleCreate()}>
            Tạo “{query.trim()}”
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.map((tag) => {
          const active = value.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(tag.id)}
              className={
                active
                  ? "rounded-[12px] border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                  : "rounded-[12px] border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
              }
            >
              {tag.name}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
};

export default TagSelector;
