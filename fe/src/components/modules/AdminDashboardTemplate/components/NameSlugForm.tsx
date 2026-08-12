"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api/client";

type NameSlugFormProps = {
  submitLabel?: string;
  onSubmit: (values: { name: string; slug?: string }) => Promise<void>;
  disabled?: boolean;
};

const NameSlugForm = ({
  submitLabel = "Tạo",
  onSubmit,
  disabled = false,
}: NameSlugFormProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (disabled || submitting) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tên không được để trống");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: trimmed,
        slug: slug.trim() || undefined,
      });
      setName("");
      setSlug("");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Không tạo được. Kiểm tra quyền ADMIN và API.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="grid gap-3 rounded-[12px] border border-border bg-background p-4 sm:grid-cols-[1fr_1fr_auto]"
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Tên *</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled || submitting}
          className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          placeholder="Tên hiển thị"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Slug (tuỳ chọn)</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={disabled || submitting}
          className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          placeholder="tu-dong-tao"
        />
      </label>
      <div className="flex items-end">
        <Button type="submit" size="sm" className="w-full sm:w-auto" disabled={disabled || submitting}>
          {submitting ? "Đang tạo…" : submitLabel}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-3">{error}</p>
      ) : null}
    </form>
  );
};

export default NameSlugForm;
