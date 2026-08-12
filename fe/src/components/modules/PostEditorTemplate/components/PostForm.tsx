"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { ApiClientError } from "@/lib/api/client";
import { createPost, updatePost } from "@/lib/api/posts";
import { buildPostPublicSlug, slugifyTitle, stripPostIdFromSlug } from "@/lib/markdown";
import type { PostCategorySummary, PostDetail, PostStatus } from "@/types/post";
import type { TagSummary } from "@/types/tag";
import { cn } from "@/lib/utils/cn";

const postSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").max(255),
  slug: z
    .string()
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "Slug chỉ gồm a-z, 0-9 và dấu gạch ngang"),
  /** Select values are strings in the DOM; coerced to number on submit. */
  categoryId: z.string().min(1, "Chọn danh mục"),
  summary: z.string().max(500).optional().or(z.literal("")),
  thumbnail: z
    .string()
    .url("URL ảnh không hợp lệ")
    .max(500)
    .optional()
    .or(z.literal("")),
  content: z.string().min(20, "Nội dung tối thiểu 20 ký tự"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: z.string().max(255).optional().or(z.literal("")),
  seoDescription: z.string().max(500).optional().or(z.literal("")),
  tagIds: z.array(z.number()),
});

type PostFormValues = z.infer<typeof postSchema>;

type PostFormProps = {
  mode: "create" | "edit";
  categories: PostCategorySummary[];
  tags: TagSummary[];
  initialPost?: PostDetail | null;
};

const fieldClass =
  "h-11 w-full rounded-[12px] border border-input bg-background px-3 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const PostForm = ({ mode, categories, tags, initialPost }: PostFormProps) => {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const submitActionRef = useRef<PostStatus>("DRAFT");

  const defaults = useMemo<PostFormValues>(
    () => ({
      title: initialPost?.title ?? "",
      slug: initialPost
        ? stripPostIdFromSlug(initialPost.slug, initialPost.id)
        : "",
      categoryId:
        initialPost?.categoryId != null
          ? String(initialPost.categoryId)
          : initialPost?.category?.id != null
            ? String(initialPost.category.id)
            : "",
      summary: initialPost?.summary ?? "",
      thumbnail: initialPost?.thumbnail ?? "",
      content: initialPost?.content ?? "",
      status: initialPost?.status ?? "DRAFT",
      seoTitle: initialPost?.seoTitle ?? "",
      seoDescription: initialPost?.seoDescription ?? "",
      tagIds: initialPost?.tags?.map((tag) => tag.id) ?? [],
    }),
    [initialPost],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: defaults,
  });

  const title = watch("title");
  const slug = watch("slug");
  const summary = watch("summary");
  const seoTitle = watch("seoTitle");
  const seoDescription = watch("seoDescription");
  const content = watch("content");
  const selectedTags = watch("tagIds");

  useEffect(() => {
    if (!slugTouched && title) {
      setValue("slug", slugifyTitle(title), { shouldValidate: true });
    }
  }, [title, slugTouched, setValue]);

  const publicSlug = buildPostPublicSlug(slug || slugifyTitle(title), initialPost?.id);
  const seoTitlePreview = (seoTitle || title || "Tiêu đề bài viết").slice(0, 60);
  const seoDescPreview = (
    seoDescription ||
    summary ||
    content.replace(/[#>*_`\[\]()!-]/g, " ").replace(/\s+/g, " ").trim() ||
    "Mô tả ngắn sẽ hiển thị trên kết quả tìm kiếm."
  ).slice(0, 160);

  const onSubmit = handleSubmit(async (values) => {
    const status = submitActionRef.current;
    const payload = {
      categoryId: Number(values.categoryId),
      title: values.title.trim(),
      content: values.content,
      slug: values.slug.trim() || undefined,
      summary: values.summary?.trim() || undefined,
      thumbnail: values.thumbnail?.trim() || undefined,
      status,
      seoTitle: values.seoTitle?.trim() || undefined,
      seoDescription: values.seoDescription?.trim() || undefined,
      tagIds: values.tagIds,
    };

    try {
      const saved =
        mode === "edit" && initialPost
          ? await updatePost(initialPost.id, payload)
          : await createPost(payload);

      router.push(saved.status === "PUBLISHED" ? `/blog/${saved.slug}` : `/blog/edit/${saved.id}`);
      router.refresh();
    } catch (error) {
      setError("root", {
        message:
          error instanceof ApiClientError
            ? error.message
            : "Không lưu được bài viết. Kiểm tra quyền ADMIN/MODERATOR và API.",
      });
    }
  });

  const toggleTag = (tagId: number) => {
    const next = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setValue("tagIds", next, { shouldDirty: true });
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-8" noValidate>
      <section className="space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Nội dung</h2>
          <p className="text-sm text-muted-foreground">
            Viết bằng Markdown - xem trước bên phải. Ưu tiên tiêu đề rõ, đoạn mở ngắn.
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Tiêu đề *</span>
          <input
            {...register("title")}
            className={fieldClass}
            placeholder="VD: Review Dreame L10s Ultra sau 30 ngày"
            maxLength={255}
          />
          {errors.title ? (
            <span className="text-xs text-destructive">{errors.title.message}</span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Slug (URL)</span>
            <input
              {...register("slug")}
              className={fieldClass}
              placeholder="review-dreame-l10s-ultra"
              onChange={(e) => {
                setSlugTouched(true);
                setValue("slug", e.target.value, { shouldValidate: true });
              }}
            />
            <span className="text-xs text-muted-foreground">
              URL công khai luôn kèm id: /blog/{publicSlug}
            </span>
            {errors.slug ? (
              <span className="block text-xs text-destructive">{errors.slug.message}</span>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Danh mục *</span>
            <select {...register("categoryId")} className={fieldClass}>
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <span className="text-xs text-destructive">{errors.categoryId.message}</span>
            ) : null}
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Tóm tắt</span>
          <textarea
            {...register("summary")}
            rows={3}
            maxLength={500}
            className="w-full rounded-[12px] border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            placeholder="1–2 câu mô tả nội dung (dùng cho list & SEO fallback)"
          />
          <span className="text-xs text-muted-foreground">
            {(summary ?? "").length}/500
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Ảnh đại diện (URL)</span>
          <input
            {...register("thumbnail")}
            className={fieldClass}
            placeholder="https://…"
          />
          {errors.thumbnail ? (
            <span className="text-xs text-destructive">{errors.thumbnail.message}</span>
          ) : null}
        </label>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">Nội dung Markdown *</span>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MarkdownEditor value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.content ? (
            <span className="text-xs text-destructive">{errors.content.message}</span>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tags</legend>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "rounded-[12px] border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}
      </section>

      <section className="space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">SEO</h2>
          <p className="text-sm text-muted-foreground">
            Tối ưu tiêu đề & mô tả hiển thị trên Google. Để trống để dùng tiêu đề/tóm tắt bài viết.
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">SEO title</span>
          <input
            {...register("seoTitle")}
            className={fieldClass}
            maxLength={255}
            placeholder={title || "Tiêu đề SEO (≤ 60 ký tự khuyến nghị)"}
          />
          <span
            className={cn(
              "text-xs",
              (seoTitle || title).length > 60 ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {(seoTitle || title || "").length}/60 khuyến nghị
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">SEO description</span>
          <textarea
            {...register("seoDescription")}
            rows={3}
            maxLength={500}
            className="w-full rounded-[12px] border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            placeholder="Mô tả hấp dẫn 140–160 ký tự"
          />
          <span
            className={cn(
              "text-xs",
              (seoDescription || summary || "").length > 160
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {(seoDescription || summary || "").length}/160 khuyến nghị
          </span>
        </label>

        <div className="rounded-[12px] border border-border bg-background p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Xem trước kết quả tìm kiếm
          </p>
          <p className="truncate text-lg text-[#1a0dab] dark:text-sky-400">{seoTitlePreview}</p>
          <p className="truncate text-sm text-emerald-700 dark:text-emerald-400">
            VESMART.local/blog/{publicSlug}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{seoDescPreview}</p>
        </div>
      </section>

      {errors.root ? (
        <p className="rounded-[12px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Quyền: ADMIN / MODERATOR · Markdown không chạy HTML thô (an toàn XSS).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              submitActionRef.current = "DRAFT";
            }}
          >
            {isSubmitting ? "Đang lưu…" : "Lưu nháp"}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => {
              submitActionRef.current = "PUBLISHED";
            }}
          >
            {isSubmitting ? "Đang đăng…" : "Xuất bản"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;
