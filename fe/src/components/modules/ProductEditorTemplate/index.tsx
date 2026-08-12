"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { listBrandsAdmin, type BrandListItem } from "@/lib/api/brands";
import {
  flattenCategoryTree,
  getCategoryTree,
  listCategoriesAdmin,
  type CategoryListItem,
} from "@/lib/api/categories";
import { getProductById } from "@/lib/api/products";
import { listTags } from "@/lib/api/tags";
import type { ProductDetail } from "@/types/product";
import type { TagSummary } from "@/types/tag";
import ProductForm from "./components/ProductForm";

type ProductEditorTemplateProps = {
  mode: "create" | "edit";
  productId?: string;
};

const ProductEditorTemplate = ({ mode, productId }: ProductEditorTemplateProps) => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    Array<CategoryListItem & { label: string }>
  >([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canEdit = isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    if (authLoading) return;
    if (!canEdit) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void (async () => {
      try {
        const [brandList, tree, flatFallback, tagList, existing] = await Promise.all([
          listBrandsAdmin(),
          getCategoryTree(),
          listCategoriesAdmin(),
          listTags({ limit: 100 }),
          mode === "edit" && productId ? getProductById(productId) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const options =
          tree.length > 0
            ? flattenCategoryTree(tree)
            : flatFallback.map((c) => ({ ...c, label: c.name }));

        setBrands(brandList);
        setCategoryOptions(options);
        setTags(tagList);
        if (mode === "edit") {
          if (!existing) {
            setLoadError("Không tìm thấy sản phẩm hoặc bạn không có quyền xem.");
          } else {
            setProduct(existing);
          }
        }
      } catch {
        if (!cancelled) setLoadError("Không tải được dữ liệu form sản phẩm.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, canEdit, mode, productId]);

  const title = useMemo(
    () => (mode === "create" ? "Tạo sản phẩm" : "Cập nhật sản phẩm"),
    [mode],
  );

  if (authLoading || loading) {
    return (
      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-[12px] bg-secondary" />
            <div className="h-56 animate-pulse rounded-[12px] bg-secondary" />
            <div className="h-72 animate-pulse rounded-[12px] bg-secondary" />
          </div>
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-[12px] bg-secondary" />
            <div className="h-48 animate-pulse rounded-[12px] bg-secondary" />
          </div>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Cần đăng nhập"
          description="Đăng nhập tài khoản ADMIN để quản lý sản phẩm."
          action={
            <Button
              type="button"
              onClick={() =>
                openAuth({
                  tab: "login",
                  next: mode === "edit" ? `/products/edit/${productId}` : "/products/new",
                })
              }
            >
              Đăng nhập
            </Button>
          }
        />
      </Container>
    );
  }

  if (!canEdit) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Không đủ quyền"
          description="Chỉ ADMIN mới tạo/sửa sản phẩm."
          action={
            <Button asChild variant="secondary">
              <Link href="/admin">Về Admin</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Không mở được form"
          description={loadError}
          action={
            <Button asChild variant="secondary">
              <Link href="/admin#products">Danh sách sản phẩm</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Sản phẩm", href: "/admin#products" },
          { label: title },
        ]}
      />
      <div className="mt-6 mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catalog SPU/SKU · giá & tồn kho theo biến thể
          </p>
        </div>
        {product ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/products/${product.slug}`}>Xem công khai</Link>
          </Button>
        ) : null}
      </div>

      <ProductForm
        mode={mode}
        brands={brands}
        categoryOptions={categoryOptions}
        tags={tags}
        initialProduct={product}
        onTagsChange={setTags}
      />
    </Container>
  );
};

export default ProductEditorTemplate;
