"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import { listCommentsByStatus, updateCommentStatus } from "@/lib/api/comments";
import type { CommentItem } from "@/types/comment";
import AdminSection from "./AdminSection";

const CommentsAdminSection = () => {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listCommentsByStatus("PENDING", { limit: 50 }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được comments.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const moderate = async (id: number, status: "APPROVED" | "REJECTED") => {
    setBusyId(id);
    setError(null);
    try {
      await updateCommentStatus(id, status);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Không cập nhật được trạng thái comment.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminSection
      id="comments"
      title="Moderation - Comments"
      description="Duyệt comment PENDING (ADMIN / MODERATOR)."
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 && !error ? (
        <EmptyState
          title="Không có comment chờ duyệt"
          description="Các bình luận PENDING sẽ hiện ở đây."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((comment) => (
            <li
              key={comment.id}
              className="space-y-3 rounded-[12px] border border-border bg-background p-4"
            >
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {comment.user?.username ?? "Ẩn danh"} · {comment.targetType} ·{" "}
                  {new Date(comment.createdAt).toLocaleString("vi-VN")}
                </p>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={busyId === comment.id}
                  onClick={() => void moderate(comment.id, "APPROVED")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === comment.id}
                  onClick={() => void moderate(comment.id, "REJECTED")}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </AdminSection>
  );
};

export default CommentsAdminSection;
