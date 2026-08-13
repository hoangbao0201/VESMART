"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { ImagePlus, X } from "lucide-react";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import AdminGate from "@/components/modules/AdminDashboardTemplate/AdminGate";
import AdminPageHeader from "@/components/modules/AdminDashboardTemplate/AdminPageHeader";
import { ApiClientError } from "@/lib/api/client";
import {
  createMediaCategory,
  deleteMediaImage,
  listMediaCategoryTreeAdmin,
  listMediaImagesAdmin,
  uploadMediaImage,
} from "@/lib/api/media";
import { cn } from "@/lib/utils/cn";
import { toCdnDisplayUrl } from "@/lib/media/cdn-image";
import type { MediaImage, MediaImageCategory } from "@/types/media";
import type { PaginationMeta } from "@/types/api";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 3;

type ChildOption = {
  id: number;
  label: string;
};

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

function flattenChildren(tree: MediaImageCategory[]): ChildOption[] {
  const out: ChildOption[] = [];
  for (const parent of tree) {
    for (const child of parent.children ?? []) {
      out.push({
        id: child.id,
        label: `${parent.name} / ${child.name}`,
      });
    }
  }
  return out;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function makeQueueItems(files: File[]): QueueItem[] {
  return files.filter(isImageFile).map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    status: "queued" as const,
    progress: 0,
  }));
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

const ImagesAdminTemplate = () => {
  return (
    <AdminGate nextPath="/admin/images">
      {() => <ImagesAdminContent />}
    </AdminGate>
  );
};

const ImagesAdminContent = () => {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tree, setTree] = useState<MediaImageCategory[]>([]);
  const [images, setImages] = useState<MediaImage[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [uploadCategoryId, setUploadCategoryId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [newParentId, setNewParentId] = useState<number | "">("");
  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const childOptions = useMemo(() => flattenChildren(tree), [tree]);
  const parents = useMemo(
    () => tree.filter((c) => c.parentId == null),
    [tree],
  );

  const queueStats = useMemo(() => {
    const total = queue.length;
    const done = queue.filter((q) => q.status === "done").length;
    const failed = queue.filter((q) => q.status === "error").length;
    const pending = queue.filter(
      (q) => q.status === "queued" || q.status === "uploading",
    ).length;
    return { total, done, failed, pending };
  }, [queue]);

  const loadTree = useCallback(async () => {
    setTree(await listMediaCategoryTreeAdmin());
  }, []);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMediaImagesAdmin({
        page,
        limit: 40,
        categoryId: categoryId === "" ? undefined : categoryId,
      });
      setImages(data.items);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Không tải được ảnh.");
      setImages([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, categoryId]);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  useEffect(() => {
    if (uploadCategoryId === "" && childOptions.length > 0) {
      setUploadCategoryId(childOptions[0].id);
    }
  }, [childOptions, uploadCategoryId]);

  useEffect(() => {
    return () => {
      for (const item of queue) URL.revokeObjectURL(item.previewUrl);
    };
    // Only revoke on unmount; queue updates manage revoke on remove/clear.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const imagesOnly = list.filter(isImageFile);
    const tooBig = imagesOnly.filter((f) => f.size > MAX_FILE_BYTES);
    const ok = imagesOnly.filter((f) => f.size <= MAX_FILE_BYTES);

    if (tooBig.length > 0) {
      setUploadError(
        `${tooBig.length} file vượt 5MB đã bị bỏ qua: ${tooBig
          .slice(0, 3)
          .map((f) => f.name)
          .join(", ")}${tooBig.length > 3 ? "…" : ""}`,
      );
    } else {
      setUploadError(null);
    }

    if (ok.length === 0) return;
    setQueue((prev) => [...prev, ...makeQueueItems(ok)]);
  }, []);

  const removeQueueItem = useCallback((id: string) => {
    setQueue((prev) => {
      const target = prev.find((q) => q.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl);
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const clearDone = useCallback(() => {
    setQueue((prev) => {
      for (const item of prev) {
        if (item.status === "done") URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((q) => q.status !== "done");
    });
  }, []);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (uploading) return;
    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (uploadCategoryId === "" || uploading || queue.length === 0) return;

    const toUpload = queue.filter((q) => q.status === "queued" || q.status === "error");
    if (toUpload.length === 0) return;

    setUploading(true);
    setUploadError(null);

    await mapPool(toUpload, UPLOAD_CONCURRENCY, async (item) => {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "uploading", progress: 0, error: undefined }
            : q,
        ),
      );
      try {
        await uploadMediaImage(
          {
            file: item.file,
            categoryId: uploadCategoryId,
            description: description.trim() || undefined,
          },
          (percent) => {
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: percent } : q)),
            );
          },
        );
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "done", progress: 100 } : q,
          ),
        );
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : "Upload thất bại.";
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "error", error: message } : q,
          ),
        );
      }
    });

    setPage(1);
    await loadImages();
    setUploading(false);
  };

  const handleCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    const name = newCatName.trim();
    if (!name || catSaving) return;
    setCatSaving(true);
    setCatError(null);
    try {
      await createMediaCategory({
        name,
        parentId: newParentId === "" ? undefined : newParentId,
      });
      setNewCatName("");
      await loadTree();
    } catch (err) {
      setCatError(
        err instanceof ApiClientError ? err.message : "Không tạo được danh mục.",
      );
    } finally {
      setCatSaving(false);
    }
  };

  const handleDelete = async (image: MediaImage) => {
    if (deletingId != null) return;
    const ok = window.confirm(`Xóa ảnh #${image.id}?`);
    if (!ok) return;
    setDeletingId(image.id);
    try {
      await deleteMediaImage(image.id);
      await loadImages();
    } catch (err) {
      window.alert(
        err instanceof ApiClientError ? err.message : "Không xóa được ảnh.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container className="py-8 sm:py-10">
      <AdminPageHeader
        title="Kho ảnh"
        description="Upload ảnh lên CDN (R2) và quản lý thư viện media."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/images" target="_blank">
              Xem trang công khai
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <section className="space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Thêm danh mục ảnh</h2>
          <p className="text-sm text-muted-foreground">
            Ảnh phải thuộc danh mục cấp 2 (con). Để trống parent = tạo nhóm gốc.
          </p>
          <form
            onSubmit={(e) => void handleCreateCategory(e)}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Parent (tuỳ chọn)
              </span>
              <select
                value={newParentId === "" ? "" : String(newParentId)}
                onChange={(e) =>
                  setNewParentId(e.target.value ? Number(e.target.value) : "")
                }
                className="h-10 w-full rounded-[12px] border border-input bg-background px-3 text-sm"
              >
                <option value="">- Nhóm gốc -</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tên *</span>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="h-10 w-full rounded-[12px] border border-input bg-background px-3 text-sm"
                placeholder="Ví dụ: Chia sẻ"
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" size="sm" disabled={catSaving || !newCatName.trim()}>
                {catSaving ? "Đang tạo…" : "Thêm danh mục"}
              </Button>
            </div>
            {catError ? (
              <p className="text-sm text-destructive sm:col-span-3">{catError}</p>
            ) : null}
          </form>
        </section>

        <section className="space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Upload ảnh</h2>
              <p className="text-sm text-muted-foreground">
                Kéo thả hoặc chọn nhiều ảnh · tối đa 5MB/file · upload song song ×{UPLOAD_CONCURRENCY}
              </p>
            </div>
            {queue.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={uploading}
                onClick={clearQueue}
              >
                Xóa hàng đợi
              </Button>
            ) : null}
          </div>

          <form onSubmit={(e) => void handleUpload(e)} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Danh mục cấp 2 *
                </span>
                <select
                  value={uploadCategoryId === "" ? "" : String(uploadCategoryId)}
                  onChange={(e) =>
                    setUploadCategoryId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  required
                  disabled={uploading}
                  className="h-10 w-full rounded-[12px] border border-input bg-background px-3 text-sm"
                >
                  <option value="" disabled>
                    Chọn danh mục
                  </option>
                  {childOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Mô tả chung (tuỳ chọn)
                </span>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                  className="h-10 w-full rounded-[12px] border border-input bg-background px-3 text-sm"
                  placeholder="Áp dụng cho toàn bộ batch"
                />
              </label>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOver(false);
              }}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-4 py-10 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary/40",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              <ImagePlus className="size-8 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-foreground">
                Kéo thả ảnh vào đây, hoặc bấm để chọn
              </p>
              <p className="text-xs text-muted-foreground">
                Hỗ trợ JPG, PNG, WebP, GIF · chọn nhiều file cùng lúc
              </p>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {queue.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hàng đợi: {queueStats.total} · xong {queueStats.done}
                  {queueStats.failed > 0 ? ` · lỗi ${queueStats.failed}` : ""}
                  {queueStats.pending > 0 ? ` · còn ${queueStats.pending}` : ""}
                </p>
                <ul className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {queue.map((item) => (
                    <li
                      key={item.id}
                      className="relative overflow-hidden rounded-[12px] border border-border bg-background"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="space-y-1 p-1.5">
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] font-medium">
                          {item.status === "queued" && "Chờ"}
                          {item.status === "uploading" && `${item.progress}%`}
                          {item.status === "done" && (
                            <span className="text-primary">Xong</span>
                          )}
                          {item.status === "error" && (
                            <span className="text-destructive" title={item.error}>
                              Lỗi
                            </span>
                          )}
                        </p>
                        {item.status === "uploading" ? (
                          <div className="h-1 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary transition-[width]"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                      {!uploading && item.status !== "uploading" ? (
                        <button
                          type="button"
                          aria-label={`Bỏ ${item.file.name}`}
                          className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-muted-foreground shadow-sm hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQueueItem(item.id);
                          }}
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={
                  uploading ||
                  uploadCategoryId === "" ||
                  queue.every((q) => q.status === "done") ||
                  queue.length === 0
                }
              >
                {uploading
                  ? `Đang upload… ${queueStats.done}/${queueStats.total}`
                  : queueStats.failed > 0
                    ? `Upload lại lỗi (${queueStats.failed})`
                    : `Upload ${queue.filter((q) => q.status === "queued").length || ""} ảnh`.trim()}
              </Button>
              {queueStats.done > 0 && !uploading ? (
                <Button type="button" size="sm" variant="secondary" onClick={clearDone}>
                  Xóa các ảnh đã xong
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Danh sách ảnh</h2>
              <p className="text-sm text-muted-foreground">
                {meta ? `${meta.total} ảnh` : "-"}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Lọc danh mục</span>
                <select
                  value={categoryId === "" ? "" : String(categoryId)}
                  onChange={(e) => {
                    setPage(1);
                    setCategoryId(e.target.value ? Number(e.target.value) : "");
                  }}
                  className="h-10 min-w-[200px] rounded-[12px] border border-input bg-background px-3 text-sm"
                >
                  <option value="">Tất cả</option>
                  {childOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void loadImages()}
              >
                Làm mới
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : images.length === 0 ? (
            <EmptyState
              title="Chưa có ảnh"
              description="Upload ảnh đầu tiên hoặc đổi bộ lọc danh mục."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {images.map((image) => {
                const hasAspect =
                  image.width != null &&
                  image.height != null &&
                  image.width > 0 &&
                  image.height > 0;
                return (
                  <li
                    key={image.id}
                    className="overflow-hidden rounded-[12px] border border-border bg-background"
                  >
                    <div
                      className="relative bg-secondary"
                      style={
                        hasAspect
                          ? { aspectRatio: `${image.width} / ${image.height}` }
                          : { aspectRatio: "1 / 1" }
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={toCdnDisplayUrl(image.url)}
                        alt={image.description || `Ảnh #${image.id}`}
                        width={image.width ?? undefined}
                        height={image.height ?? undefined}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-2.5">
                      <p className="truncate text-xs text-muted-foreground">
                        #{image.id}
                        {hasAspect ? ` · ${image.width}×${image.height}` : ""}
                      </p>
                      {image.description ? (
                        <p className="line-clamp-2 text-xs">{image.description}</p>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className={cn("w-full")}
                        disabled={deletingId === image.id}
                        onClick={() => void handleDelete(image)}
                      >
                        {deletingId === image.id ? "Đang xóa…" : "Xóa"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {meta && meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page}/{meta.totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </Container>
  );
};

export default ImagesAdminTemplate;
