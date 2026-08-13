"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import {
  createThread,
  deleteThread,
  getThreadBySlug,
  listForumCategoriesAdmin,
  listThreadsAdmin,
  updateThread,
} from "@/lib/api/forums";
import type { ForumListItem, ThreadListItem, ThreadStatus } from "@/types/forum";
import AdminSection from "./AdminSection";

type ThreadsAdminSectionProps = {
  canCreate: boolean;
};

const STATUS_OPTIONS: Array<ThreadStatus | ""> = ["", "OPEN", "CLOSED", "HIDDEN"];

const ThreadsAdminSection = ({ canCreate }: ThreadsAdminSectionProps) => {
  const [items, setItems] = useState<ThreadListItem[]>([]);
  const [forums, setForums] = useState<Array<ForumListItem & { categoryName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ThreadStatus | "">("");
  const [forumFilter, setForumFilter] = useState<number | "">("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [forumId, setForumId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const loadForums = useCallback(async () => {
    const cats = await listForumCategoriesAdmin();
    const flat = cats.flatMap((c) =>
      (c.forums ?? []).map((f) => ({ ...f, categoryName: c.name })),
    );
    setForums(flat);
    setForumId((prev) => (prev === "" && flat[0] ? flat[0].id : prev));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listThreadsAdmin({
        limit: 40,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        forumId: forumFilter || undefined,
      });
      setItems(page.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được threads.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, forumFilter]);

  useEffect(() => {
    void loadForums().catch(() => undefined);
  }, [loadForums]);

  useEffect(() => {
    void load();
  }, [load]);

  const forumOptions = useMemo(() => forums, [forums]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!canCreate || forumId === "") return;
    if (!title.trim() || !content.trim()) {
      setError("Tiêu đề và nội dung thread là bắt buộc.");
      return;
    }
    setBusyId(-1);
    setError(null);
    try {
      await createThread({
        forumId: Number(forumId),
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tạo được thread.");
    } finally {
      setBusyId(null);
    }
  };

  const patch = async (
    id: number,
    input: {
      title?: string;
      content?: string;
      isPinned?: boolean;
      isLocked?: boolean;
      status?: ThreadStatus;
    },
  ) => {
    setBusyId(id);
    setError(null);
    try {
      await updateThread(id, input);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không cập nhật được thread.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa thread này?")) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteThread(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được thread.");
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = async (thread: ThreadListItem) => {
    setEditingId(thread.id);
    setEditTitle(thread.title);
    setEditContent(thread.content ?? "");
    setBusyId(thread.id);
    try {
      const detail = await getThreadBySlug(thread.slug);
      if (detail) {
        setEditTitle(detail.title);
        setEditContent(detail.content);
      }
    } catch {
      // keep list payload
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId == null) return;
    if (!editTitle.trim() || !editContent.trim()) {
      setError("Tiêu đề và nội dung không được trống.");
      return;
    }
    await patch(editingId, {
      title: editTitle.trim(),
      content: editContent.trim(),
    });
    setEditingId(null);
  };

  return (
    <AdminSection
      id="threads"
      title="Threads"
      description="Quản lý chủ đề: tạo, sửa, ghim, khóa, ẩn, xóa (ADMIN / MODERATOR)."
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tiêu đề / nội dung"
          className="h-10 rounded-[12px] border border-input bg-card px-3 text-sm"
        />
        <select
          value={forumFilter}
          onChange={(e) => setForumFilter(e.target.value ? Number(e.target.value) : "")}
          className="h-10 rounded-[12px] border border-input bg-card px-3 text-sm"
        >
          <option value="">Mọi forum</option>
          {forumOptions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.categoryName} / {f.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || "") as ThreadStatus | "")}
          className="h-10 rounded-[12px] border border-input bg-card px-3 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "Mọi status"}
            </option>
          ))}
        </select>
        <Button type="button" size="sm" variant="secondary" onClick={() => void load()}>
          Lọc
        </Button>
      </div>

      {canCreate ? (
        <form
          onSubmit={(e) => void create(e)}
          className="mb-4 grid gap-3 rounded-[12px] border border-border bg-background p-4"
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Forum *</span>
            <select
              value={forumId}
              onChange={(e) => setForumId(e.target.value ? Number(e.target.value) : "")}
              className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
            >
              {forumOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.categoryName} / {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tiêu đề *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Nội dung *</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <Button type="submit" size="sm" disabled={busyId === -1 || forumOptions.length === 0}>
            {busyId === -1 ? "Đang tạo…" : "Tạo thread"}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 && !error ? (
        <EmptyState title="Chưa có thread" />
      ) : (
        <ul className="space-y-3">
          {items.map((thread) => (
            <li
              key={thread.id}
              className="space-y-3 rounded-[12px] border border-border bg-background p-4"
            >
              {editingId === thread.id ? (
                <form onSubmit={(e) => void saveEdit(e)} className="grid gap-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-9 rounded-[10px] border border-input bg-card px-3 text-sm"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    className="rounded-[10px] border border-input bg-card px-3 py-2 text-sm"
                    placeholder="Nội dung (để trống nếu không đổi)"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={busyId === thread.id}>
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="font-medium">{thread.title}</p>
                    <p className="text-xs text-muted-foreground">
                      #{thread.id} · {thread.forum?.name ?? "—"} · {thread.status ?? "OPEN"} ·{" "}
                      {thread.user?.username ?? "—"} · {thread.replyCount} reply · {thread.views}{" "}
                      view
                      {thread.isPinned ? " · PIN" : ""}
                      {thread.isLocked ? " · LOCK" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/forums/posts?threadId=${thread.id}&title=${encodeURIComponent(thread.title)}`}
                      >
                        Posts
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === thread.id}
                      onClick={() => void startEdit(thread)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === thread.id}
                      onClick={() =>
                        void patch(thread.id, { isPinned: !thread.isPinned })
                      }
                    >
                      {thread.isPinned ? "Bỏ ghim" : "Ghim"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === thread.id}
                      onClick={() =>
                        void patch(thread.id, { isLocked: !thread.isLocked })
                      }
                    >
                      {thread.isLocked ? "Mở khóa" : "Khóa"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === thread.id}
                      onClick={() =>
                        void patch(thread.id, {
                          status: thread.status === "HIDDEN" ? "OPEN" : "HIDDEN",
                        })
                      }
                    >
                      {thread.status === "HIDDEN" ? "Hiện" : "Ẩn"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === thread.id}
                      onClick={() => void remove(thread.id)}
                    >
                      Xóa
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/forum/threads/${thread.slug}`} target="_blank">
                        Xem
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </AdminSection>
  );
};

export default ThreadsAdminSection;
