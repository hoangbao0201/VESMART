"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api/client";
import { createForumAuto, listForumCategoriesAdmin } from "@/lib/api/forums";
import type { ForumListItem } from "@/types/forum";
import AdminSection from "./AdminSection";

type FlatForum = ForumListItem & { categoryName: string };

type ForumAutoResult = {
  replyCount: number;
  scrapedComments: number;
  opAuthor: string;
  thread: { id: number; slug: string; title: string };
};

const ForumAutoAdminSection = () => {
  const [forums, setForums] = useState<FlatForum[]>([]);
  const [forumId, setForumId] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [loadingForums, setLoadingForums] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForumAutoResult | null>(null);

  const loadForums = useCallback(async () => {
    setLoadingForums(true);
    setError(null);
    try {
      const cats = await listForumCategoriesAdmin();
      const flat = cats.flatMap((c) =>
        (c.forums ?? []).map((f) => ({ ...f, categoryName: c.name })),
      );
      setForums(flat);
      setForumId((prev) => (prev === "" && flat[0] ? flat[0].id : prev));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được forums.");
      setForums([]);
    } finally {
      setLoadingForums(false);
    }
  }, []);

  useEffect(() => {
    void loadForums();
  }, [loadForums]);

  const forumOptions = useMemo(() => forums, [forums]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (forumId === "") {
      setError("Chọn forum.");
      return;
    }
    if (!content.trim()) {
      setError("Nhập nội dung thread.");
      return;
    }
    if (!facebookUrl.trim()) {
      setError("Nhập URL post Facebook.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const data = await createForumAuto({
        forumId: Number(forumId),
        content: content.trim(),
        facebookUrl: facebookUrl.trim(),
      });
      setResult(data);
      setContent("");
      setFacebookUrl("");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Không tạo được thread từ Facebook.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSection
      id="forum-auto"
      title="Forum Auto"
      description="Chọn forum, nhập nội dung thread, dán URL Facebook → scrape comments và tạo thread + replies."
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="grid gap-3 rounded-[12px] border border-border bg-background p-4"
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Forum *</span>
          <select
            value={forumId}
            onChange={(e) => setForumId(e.target.value ? Number(e.target.value) : "")}
            disabled={loadingForums || submitting || forumOptions.length === 0}
            className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
          >
            {forumOptions.length === 0 ? (
              <option value="">Chưa có forum</option>
            ) : (
              forumOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.categoryName} / {f.name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Nội dung thread *
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            rows={6}
            placeholder="Nội dung OP (tiêu đề lấy từ dòng đầu)"
            className="w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            URL post Facebook *
          </span>
          <input
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            disabled={submitting}
            placeholder="https://www.facebook.com/groups/.../posts/..."
            className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={submitting || loadingForums || forumOptions.length === 0}
          >
            {submitting ? "Đang tạo…" : "Tạo"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={loadingForums}
            onClick={() => void loadForums()}
          >
            Làm mới forums
          </Button>
        </div>
      </form>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {result ? (
        <div className="mt-3 space-y-1 rounded-[12px] border border-border bg-secondary/30 p-3 text-sm">
          <p>
            Đã tạo thread{" "}
            <Link
              href={`/forum/threads/${result.thread.slug}`}
              className="font-medium text-primary hover:underline"
              target="_blank"
            >
              {result.thread.title}
            </Link>
          </p>
          <p className="text-muted-foreground">
            OP: {result.opAuthor} · {result.replyCount} replies (scrape{" "}
            {result.scrapedComments} comments)
          </p>
        </div>
      ) : null}
    </AdminSection>
  );
};

export default ForumAutoAdminSection;
