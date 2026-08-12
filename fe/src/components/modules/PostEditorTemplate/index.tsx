"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { listPostCategories, getPostById } from "@/lib/api/posts";
import { listTags } from "@/lib/api/tags";
import type { PostCategorySummary, PostDetail } from "@/types/post";
import type { TagSummary } from "@/types/tag";
import PostForm from "./components/PostForm";

type PostEditorTemplateProps = {
  mode: "create" | "edit";
  postId?: string;
};

const PostEditorTemplate = ({ mode, postId }: PostEditorTemplateProps) => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const [categories, setCategories] = useState<PostCategorySummary[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canEdit =
    isAuthenticated && (user?.role === "ADMIN" || user?.role === "MODERATOR");

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
        const [cats, tagList, existing] = await Promise.all([
          listPostCategories(),
          listTags({ limit: 100 }),
          mode === "edit" && postId ? getPostById(postId) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setTags(tagList);
        if (mode === "edit") {
          if (!existing) {
            setLoadError("Không tìm thấy bài viết hoặc bạn không có quyền xem.");
          } else {
            setPost(existing);
          }
        }
      } catch {
        if (!cancelled) setLoadError("Không tải được dữ liệu form.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, canEdit, mode, postId]);

  if (authLoading || loading) {
    return (
      <Container className="py-10">
        <p className="text-sm text-muted-foreground">Đang tải trình soạn thảo…</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Cần đăng nhập"
          description="Đăng nhập tài khoản ADMIN hoặc MODERATOR để tạo / sửa bài viết."
        />
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            onClick={() =>
              openAuth({
                tab: "login",
                next: mode === "edit" ? `/blog/edit/${postId}` : "/blog/new",
              })
            }
          >
            Đăng nhập
          </Button>
        </div>
      </Container>
    );
  }

  if (!canEdit) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Không đủ quyền"
          description="Chỉ ADMIN / MODERATOR được tạo và cập nhật bài viết."
        />
      </Container>
    );
  }

  if (mode === "edit" && (loadError || !post)) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Không mở được bài viết"
          description={loadError ?? "Bài viết không tồn tại."}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/blog">Về bài viết</Link>
          </Button>
          <Button asChild>
            <Link href="/blog/new">Viết bài mới</Link>
          </Button>
        </div>
      </Container>
    );
  }

  if (categories.length === 0) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Chưa có danh mục bài viết"
          description="Tạo Post Category trong Admin trước khi viết bài."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link href="/admin#posts">Mở Admin</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Bài viết", href: "/blog" },
          { label: mode === "create" ? "Viết bài mới" : "Chỉnh sửa" },
        ]}
      />

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {mode === "create" ? "Viết bài mới" : "Cập nhật bài viết"}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Soạn thảo Markdown, tối ưu SEO, xuất bản hoặc lưu nháp.
          </p>
        </div>
        {mode === "edit" && post ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/${post.slug}`}>Xem bài công khai</Link>
          </Button>
        ) : null}
      </div>

      <PostForm
        key={post?.id ?? "create"}
        mode={mode}
        categories={categories}
        tags={tags}
        initialPost={post}
      />
    </Container>
  );
};

export default PostEditorTemplate;
