"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import {
  createForumPost,
  deleteForumPost,
  listForumPostsAdmin,
  updateForumPost,
} from "@/lib/api/forums";
import type { ForumPostItem, ThreadListItem } from "@/types/forum";
import AdminSection from "./AdminSection";

type ForumPostsAdminSectionProps = {
  selectedThread: ThreadListItem | null;
};

const ForumPostsAdminSection = ({ selectedThread }: ForumPostsAdminSectionProps) => {
  const [items, setItems] = useState<ForumPostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newContent, setNewContent] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listForumPostsAdmin({
        limit: 50,
        threadId: selectedThread?.id,
        search: search.trim() || undefined,
      });
      setItems(page.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được posts.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedThread?.id, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedThread) {
      setError("Chọn một thread ở danh sách trên để thêm reply.");
      return;
    }
    if (!newContent.trim()) {
      setError("Nội dung reply không được trống.");
      return;
    }
    setBusyId(-1);
    setError(null);
    try {
      await createForumPost(selectedThread.id, { content: newContent.trim() });
      setNewContent("");
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tạo được post.");
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId == null) return;
    if (!editContent.trim()) {
      setError("Nội dung không được trống.");
      return;
    }
    setBusyId(editingId);
    setError(null);
    try {
      await updateForumPost(editingId, { content: editContent.trim() });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không cập nhật được post.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa post này?")) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteForumPost(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được post.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminSection
      id="forum-posts"
      title="Forum posts"
      description={
        selectedThread
          ? `Reply trong thread #${selectedThread.id}: ${selectedThread.title}`
          : "Danh sách reply gần đây. Từ Threads bấm Posts để lọc theo thread."
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedThread ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/forums/posts">Bỏ lọc thread</Link>
          </Button>
        ) : null}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm nội dung post"
          className="h-10 min-w-[200px] flex-1 rounded-[12px] border border-input bg-card px-3 text-sm"
        />
        <Button type="button" size="sm" variant="secondary" onClick={() => void load()}>
          Làm mới
        </Button>
      </div>

      {selectedThread ? (
        <form
          onSubmit={(e) => void create(e)}
          className="mb-4 grid gap-3 rounded-[12px] border border-border bg-background p-4"
        >
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            placeholder="Viết reply mới…"
            className="w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm" disabled={busyId === -1}>
            {busyId === -1 ? "Đang gửi…" : "Thêm reply"}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 && !error ? (
        <EmptyState title="Chưa có post" />
      ) : (
        <ul className="space-y-3">
          {items.map((post) => (
            <li
              key={post.id}
              className="space-y-3 rounded-[12px] border border-border bg-background p-4"
            >
              {editingId === post.id ? (
                <form onSubmit={(e) => void saveEdit(e)} className="grid gap-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="rounded-[10px] border border-input bg-card px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={busyId === post.id}>
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
                    <p className="text-xs text-muted-foreground">
                      #{post.id} · {post.user?.username ?? "—"} ·{" "}
                      {new Date(post.createdAt).toLocaleString("vi-VN")}
                      {post.thread ? (
                        <>
                          {" "}
                          ·{" "}
                          <Link
                            href={`/forum/threads/${post.thread.slug}`}
                            className="hover:underline"
                            target="_blank"
                          >
                            {post.thread.title}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === post.id}
                      onClick={() => {
                        setEditingId(post.id);
                        setEditContent(post.content);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === post.id}
                      onClick={() => void remove(post.id)}
                    >
                      Xóa
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

export default ForumPostsAdminSection;
