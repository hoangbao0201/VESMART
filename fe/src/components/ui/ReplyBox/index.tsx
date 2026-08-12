"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { apiPost, ApiClientError } from "@/lib/api/client";
import "@/components/ui/ForumPostBlock/forum-post.css";

type ReplyBoxProps = {
  threadId: string | number;
  locked?: boolean;
  variant?: "default" | "forum";
};

const ReplyBox = ({ threadId, locked, variant = "default" }: ReplyBoxProps) => {
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isForum = variant === "forum";

  if (locked) {
    return (
      <p
        className={
          isForum
            ? "text-sm text-muted-foreground"
            : "rounded-[12px] border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground"
        }
      >
        Chủ đề này đã bị khóa - không thể trả lời.
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-muted-foreground">
        <button
          type="button"
          className={
            isForum
              ? "font-medium text-[#1565c0] hover:underline dark:text-[#64b5f6]"
              : "font-medium text-primary hover:underline"
          }
          onClick={() => openAuth("login")}
        >
          Đăng nhập
        </button>{" "}
        để trả lời chủ đề.
      </p>
    );
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await apiPost(`/threads/${encodeURIComponent(String(threadId))}/posts`, {
        auth: true,
        body: { content: content.trim() },
      });
      setContent("");
      setMessage("Đã gửi trả lời. Làm mới trang để xem bài mới.");
    } catch (error) {
      setMessage(
        error instanceof ApiClientError
          ? error.message
          : "Không gửi được trả lời. Thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isForum) {
    return (
      <form onSubmit={(e) => void onSubmit(e)}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Viết trả lời của bạn… (hỗ trợ Markdown cơ bản)"
          className="forum-quick-reply-textarea"
          aria-label="Nội dung trả lời"
        />
        {message ? (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        ) : null}
        <div className="forum-quick-reply-actions">
          <span className="text-xs text-muted-foreground">
            Hỗ trợ **in đậm**, danh sách, link
          </span>
          <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
            {submitting ? "Đang gửi…" : "Gửi trả lời"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Trả lời</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Nội dung trả lời…"
          className="w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </label>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={submitting || !content.trim()}>
        {submitting ? "Đang gửi…" : "Gửi trả lời"}
      </Button>
    </form>
  );
};

export default ReplyBox;
