"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import ProductCard from "@/components/ui/ProductCard";
import BlogCard from "@/components/ui/BlogCard";
import ThreadRow from "@/components/ui/ThreadRow";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { listFavorites } from "@/lib/api/favorites";
import type { FavoriteItem } from "@/types/favorite";

const AccountFavoritesTemplate = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { openAuth } = useAuthModal();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void listFavorites()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  if (!authLoading && !isAuthenticated) {
    return (
      <Container className="py-8 sm:py-10">
        <EmptyState
          title="Cần đăng nhập"
          description="Đăng nhập để xem danh sách yêu thích của bạn."
        />
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            onClick={() => openAuth({ tab: "login", next: "/account/favorites" })}
          >
            Đăng nhập
          </Button>
        </div>
      </Container>
    );
  }

  const products = items.filter((i) => i.targetType === "PRODUCT" && i.product);
  const posts = items.filter((i) => i.targetType === "POST" && i.post);
  const threads = items.filter((i) => i.targetType === "THREAD" && i.thread);
  const orphanCount =
    items.length - products.length - posts.length - threads.length;

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Yêu thích" },
        ]}
      />

      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Yêu thích</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Sản phẩm, bài viết và chủ đề bạn đã lưu.
        </p>
      </div>

      {loading || authLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có mục yêu thích"
          description="Nhấn “Yêu thích” trên sản phẩm, bài viết hoặc chủ đề để lưu tại đây."
        />
      ) : (
        <div className="space-y-10">
          {products.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Sản phẩm</h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((item) =>
                  item.product ? (
                    <li key={item.id}>
                      <ProductCard product={item.product} />
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          {posts.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Bài viết</h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((item) =>
                  item.post ? (
                    <li key={item.id}>
                      <BlogCard post={item.post} />
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          {threads.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Chủ đề</h2>
              <ul className="space-y-2">
                {threads.map((item) =>
                  item.thread ? (
                    <li key={item.id}>
                      <ThreadRow thread={item.thread} />
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          {orphanCount > 0 ? (
            <EmptyState
              title={`${orphanCount} mục chưa resolve được nội dung`}
              description="API favorites có thể chưa embed product/post/thread - vẫn đã lưu target_id."
            />
          ) : null}
        </div>
      )}
    </Container>
  );
};

export default AccountFavoritesTemplate;
