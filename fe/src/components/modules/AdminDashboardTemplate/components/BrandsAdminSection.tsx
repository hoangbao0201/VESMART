"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { createBrand, listBrandsAdmin, type BrandListItem } from "@/lib/api/brands";
import { ApiClientError } from "@/lib/api/client";
import AdminSection from "./AdminSection";
import NameSlugForm from "./NameSlugForm";

type BrandsAdminSectionProps = {
  canCreate: boolean;
};

const BrandsAdminSection = ({ canCreate }: BrandsAdminSectionProps) => {
  const [items, setItems] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listBrandsAdmin());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được brands.");
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
      id="brands"
      title="Thương hiệu"
      description="Danh sách brand và tạo mới (ADMIN)."
    >
      {canCreate ? (
        <NameSlugForm
          submitLabel="Thêm brand"
          onSubmit={async (values) => {
            await createBrand(values);
            await load();
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Chỉ ADMIN mới tạo được thương hiệu.</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có thương hiệu" description="Tạo brand đầu tiên ở form trên." />
      ) : (
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {items.map((brand) => (
            <li
              key={brand.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
            >
              <span className="font-medium">{brand.name}</span>
              <span className="text-muted-foreground">{brand.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </AdminSection>
  );
};

export default BrandsAdminSection;
