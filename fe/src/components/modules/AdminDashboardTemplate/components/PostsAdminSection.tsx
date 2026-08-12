"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import { listPostsAdmin } from "@/lib/api/posts";
import type { PostListItem } from "@/types/post";
import AdminSection from "./AdminSection";

const PostsAdminSection = () => {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listPostsAdmin({ limit: 50 }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được bài viết.");
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
      id="posts"
      title="Bài viết blog"
      description="Tạo / sửa bằng Markdown editor - SEO title & description."
    >
      <div className="mb-3">
        <Link
          href="/blog/new"
          className="inline-flex h-10 items-center rounded-[12px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:opacity-90"
        >
          Viết bài mới
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có bài viết" description="Tạo bài đầu tiên tại /blog/new." />
      ) : (
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {items.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {post.status ?? "-"}
                  {post.category?.name ? ` · ${post.category.name}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-3 text-sm font-medium">
                <Link href={`/blog/edit/${post.id}`} className="text-primary hover:underline">
                  Sửa
                </Link>
                <Link href={`/blog/${post.slug}`} className="text-muted-foreground hover:underline">
                  Xem
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminSection>
  );
};

export default PostsAdminSection;
