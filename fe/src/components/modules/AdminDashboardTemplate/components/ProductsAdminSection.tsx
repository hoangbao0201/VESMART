"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import { listProductsAdmin } from "@/lib/api/products";
import type { ProductListItem } from "@/types/product";
import AdminSection from "./AdminSection";

type ProductsAdminSectionProps = {
  canCreate: boolean;
};

function statusLabel(product: ProductListItem): string {
  if (product.status) return product.status;
  if (product.published) return "PUBLISHED";
  return "DRAFT";
}

const ProductsAdminSection = ({ canCreate }: ProductsAdminSectionProps) => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await listProductsAdmin({ limit: 50 });
      setItems(products);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được sản phẩm.");
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
      id="products"
      title="Sản phẩm"
      description="Quản lý catalog SPU/SKU - tạo và chỉnh sửa trên trang riêng."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {canCreate ? (
          <Button asChild size="sm">
            <Link href="/admin/products/new">Thêm sản phẩm</Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Chỉ ADMIN mới tạo được sản phẩm.</p>
        )}
        <Button type="button" size="sm" variant="secondary" onClick={() => void load()}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm"
          description="Tạo sản phẩm đầu tiên hoặc seed dữ liệu từ BE."
          action={
            canCreate ? (
              <Button asChild size="sm">
                <Link href="/admin/products/new">Tạo sản phẩm</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-[12px] border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Tên</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Brand</th>
                <th className="px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-2.5 font-medium">{product.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{statusLabel(product)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {product.brand?.name ?? "-"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-3">
                      {canCreate ? (
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          Sửa
                        </Link>
                      ) : null}
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-muted-foreground hover:underline"
                      >
                        Xem
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
};

export default ProductsAdminSection;
