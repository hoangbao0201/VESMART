"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ApiClientError } from "@/lib/api/client";
import {
  createForum,
  deleteForum,
  listForumCategoriesAdmin,
  updateForum,
} from "@/lib/api/forums";
import type { ForumCategoryItem, ForumListItem } from "@/types/forum";
import AdminSection from "./AdminSection";

type ForumsAdminSectionProps = {
  canManage: boolean;
  refreshKey?: number;
};

type FlatForum = ForumListItem & { categoryId: number; categoryName: string };

const ForumsAdminSection = ({ canManage, refreshKey = 0 }: ForumsAdminSectionProps) => {
  const [categories, setCategories] = useState<ForumCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [categoryId, setCategoryId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [editCategoryId, setEditCategoryId] = useState<number | "">("");
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await listForumCategoriesAdmin();
      setCategories(cats);
      setCategoryId((prev) => (prev === "" && cats[0] ? cats[0].id : prev));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được forums.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const forums = useMemo<FlatForum[]>(
    () =>
      categories.flatMap((cat) =>
        (cat.forums ?? []).map((f) => ({
          ...f,
          categoryId: cat.id,
          categoryName: cat.name,
        })),
      ),
    [categories],
  );

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManage || categoryId === "") return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tên forum không được trống.");
      return;
    }
    setBusyId(-1);
    setError(null);
    try {
      await createForum({
        categoryId: Number(categoryId),
        name: trimmed,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
      });
      setName("");
      setSlug("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tạo được forum.");
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (forum: FlatForum) => {
    setEditingId(forum.id);
    setEditCategoryId(forum.categoryId);
    setEditName(forum.name);
    setEditSlug(forum.slug);
    setEditDescription(forum.description ?? "");
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId == null || editCategoryId === "") return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Tên forum không được trống.");
      return;
    }
    setBusyId(editingId);
    setError(null);
    try {
      await updateForum(editingId, {
        categoryId: Number(editCategoryId),
        name: trimmed,
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || null,
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không cập nhật được forum.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa forum này? Thread thuộc forum sẽ không hiện trên list category.")) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await deleteForum(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không xóa được forum.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminSection
      id="forums"
      title="Forums"
      description="Diễn đàn con trong từng category: thêm / sửa / xóa (ADMIN)."
    >
      {canManage ? (
        <form
          onSubmit={(e) => void create(e)}
          className="mb-4 grid gap-3 rounded-[12px] border border-border bg-background p-4 sm:grid-cols-2"
        >
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Category *</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tên *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
              placeholder="Ecovacs"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
              placeholder="ecovacs"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Mô tả</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={busyId === -1 || categories.length === 0}>
              {busyId === -1 ? "Đang tạo…" : "Thêm forum"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">Chỉ ADMIN mới tạo/sửa/xóa forum.</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : forums.length === 0 && !error ? (
        <EmptyState title="Chưa có forum" description="Tạo category trước, rồi thêm forum." />
      ) : (
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {forums.map((forum) => (
            <li key={forum.id} className="space-y-3 px-3 py-2.5 text-sm">
              {editingId === forum.id ? (
                <form onSubmit={(e) => void saveEdit(e)} className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={editCategoryId}
                    onChange={(e) =>
                      setEditCategoryId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="h-9 rounded-[10px] border border-input bg-card px-3 sm:col-span-2"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 rounded-[10px] border border-input bg-card px-3"
                  />
                  <input
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="h-9 rounded-[10px] border border-input bg-card px-3"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="rounded-[10px] border border-input bg-card px-3 py-2 sm:col-span-2"
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" disabled={busyId === forum.id}>
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
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{forum.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {forum.categoryName} · {forum.slug} · {forum.threadCount} thread ·{" "}
                      {forum.postCount} post
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === forum.id}
                        onClick={() => startEdit(forum)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === forum.id}
                        onClick={() => void remove(forum.id)}
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
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </AdminSection>
  );
};

export default ForumsAdminSection;
