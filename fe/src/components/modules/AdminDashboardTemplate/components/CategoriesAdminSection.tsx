"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import {
  createCategory,
  listCategoriesAdmin,
  type CategoryListItem,
} from "@/lib/api/categories";
import { ApiClientError } from "@/lib/api/client";
import AdminSection from "./AdminSection";
import NameSlugForm from "./NameSlugForm";

type CategoriesAdminSectionProps = {
  canCreate: boolean;
};

const CategoriesAdminSection = ({ canCreate }: CategoriesAdminSectionProps) => {
  const [items, setItems] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listCategoriesAdmin());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được danh mục.");
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
      id="categories"
      title="Danh mục sản phẩm"
      description="Danh mục catalog phẳng + tạo mới (ADMIN)."
    >
      {canCreate ? (
        <NameSlugForm
          submitLabel="Thêm danh mục"
          onSubmit={async (values) => {
            await createCategory(values);
            await load();
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Chỉ ADMIN mới tạo được danh mục.</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có danh mục" description="Tạo danh mục đầu tiên ở form trên." />
      ) : (
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {items.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
            >
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground">{category.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </AdminSection>
  );
};

export default CategoriesAdminSection;
