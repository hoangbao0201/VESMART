"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import {
  createForumCategory,
  listForumCategoriesAdmin,
} from "@/lib/api/forums";
import type { ForumCategoryItem } from "@/types/forum";
import AdminSection from "./AdminSection";
import NameSlugForm from "./NameSlugForm";

type ForumCategoriesAdminSectionProps = {
  canCreate: boolean;
};

const ForumCategoriesAdminSection = ({
  canCreate,
}: ForumCategoriesAdminSectionProps) => {
  const [items, setItems] = useState<ForumCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listForumCategoriesAdmin());
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Không tải được forum categories.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminSection
      id="forums"
      title="Forum categories"
      description="Cấu hình nhóm diễn đàn (ADMIN tạo mới)."
    >
      {canCreate ? (
        <NameSlugForm
          submitLabel="Thêm category"
          onSubmit={async (values) => {
            await createForumCategory(values);
            await load();
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Chỉ ADMIN mới tạo được forum category.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có forum category" />
      ) : (
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {items.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
            >
              <div>
                <span className="font-medium">{cat.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {cat.forums?.length ?? 0} forum
                </span>
              </div>
              <span className="text-muted-foreground">{cat.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </AdminSection>
  );
};

export default ForumCategoriesAdminSection;
