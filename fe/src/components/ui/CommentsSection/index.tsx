"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { createComment, listComments } from "@/lib/api/comments";
import type { CommentItem, TargetType } from "@/types/comment";
import { formatRelativeTime } from "@/lib/utils/format";
import { ApiClientError } from "@/lib/api/client";

type CommentsSectionProps = {
  targetType: Extract<TargetType, "PRODUCT" | "POST">;
  targetId: string | number;
};

const CommentsSection = ({ targetType, targetId }: CommentsSectionProps) => {
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listComments({ targetType, targetId })
      .then((items) => {
        if (!cancelled) setComments(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createComment({
        targetType,
        targetId,
        content: content.trim(),
      });
      setComments((prev) => [...prev, created]);
      setContent("");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Không gửi được bình luận. Đăng nhập hoặc thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-lg font-semibold">
        Bình luận
      </h2>

      {isAuthenticated ? (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Viết bình luận của bạn…"
            className="w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
            {submitting ? "Đang gửi…" : "Gửi bình luận"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => openAuth("login")}
          >
            Đăng nhập
          </button>{" "}
          để bình luận.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải bình luận…</p>
      ) : comments.length === 0 ? (
        <EmptyState
          title="Chưa có bình luận"
          description="Hãy là người đầu tiên chia sẻ ý kiến."
        />
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const username = comment.user?.username ?? "Thành viên";
            return (
              <li
                key={comment.id}
                className="rounded-[12px] border border-border bg-card px-4 py-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar username={username} avatar={comment.user?.avatar} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{username}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={comment.createdAt}>
                        {formatRelativeTime(comment.createdAt) ?? ""}
                      </time>
                      {comment.status === "PENDING" ? (
                        <span className="rounded-md bg-secondary px-1.5 py-0.5">Chờ duyệt</span>
                      ) : null}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-card-foreground">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default CommentsSection;
