"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import {
  createForumCategory,
  deleteForumCategory,
  listForumCategoriesAdmin,
  updateForumCategory,
} from "@/lib/api/forums";
import type { ForumCategoryItem } from "@/types/forum";
import AdminSection from "./AdminSection";
import NameSlugForm from "./NameSlugForm";

type ForumCategoriesAdminSectionProps = {
  canManage: boolean;
  onChanged?: () => void;
};

const ForumCategoriesAdminSection = ({
  canManage,
  onChanged,
}: ForumCategoriesAdminSectionProps) => {
  const [items, setItems] = useState<ForumCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listForumCategoriesAdmin());
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Không tải được forum categories.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (cat: ForumCategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description ?? "");
    setError(null);
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId == null) return;
    const name = editName.trim();
    if (!name) {
      setError("Tên category không được trống.");
      return;
    }
    setBusyId(editingId);
    setError(null);
    try {
      await updateForumCategory(editingId, {
        name,
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || null,
      });
      setEditingId(null);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không cập nhật được category.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa category này? Forum bên trong nên chuyển/xóa trước.")) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteForumCategory(id);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được category.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminSection
      id="forum-categories"
      title="Forum categories"
      description="Nhóm diễn đàn: thêm / sửa / xóa (ADMIN)."
    >
      {canManage ? (
        <NameSlugForm
          submitLabel="Thêm category"
          onSubmit={async (values) => {
            await createForumCategory(values);
            await load();
            onChanged?.();
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Chỉ ADMIN mới quản lý category.</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : items.length === 0 && !error ? (
        <EmptyState title="Chưa có forum category" />
      ) : (
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {items.map((cat) => (
            <li key={cat.id} className="space-y-3 px-3 py-2.5 text-sm">
              {editingId === cat.id ? (
                <form onSubmit={(e) => void saveEdit(e)} className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 rounded-[10px] border border-input bg-card px-3"
                    placeholder="Tên"
                  />
                  <input
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="h-9 rounded-[10px] border border-input bg-card px-3"
                    placeholder="Slug"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="rounded-[10px] border border-input bg-card px-3 py-2 sm:col-span-2"
                    placeholder="Mô tả"
                  />
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" disabled={busyId === cat.id}>
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {cat.forums?.length ?? 0} forum · {cat.slug}
                    </span>
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === cat.id}
                        onClick={() => startEdit(cat)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === cat.id}
                        onClick={() => void remove(cat.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </AdminSection>
  );
};

export default ForumCategoriesAdminSection;
