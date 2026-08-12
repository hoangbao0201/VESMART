import type { TagSummary } from "@/types/tag";

export type PostCategorySummary = {
  id: number;
  name: string;
  slug: string;
};

export type PostAuthorSummary = {
  id: number;
  username: string;
  avatar: string | null;
};

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PostListItem = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  views: number;
  status?: PostStatus;
  category?: PostCategorySummary | null;
  author?: PostAuthorSummary | null;
};

export type PostDetail = PostListItem & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  tags?: TagSummary[];
  categoryId?: number;
  updatedAt?: string | null;
};

export type UpsertPostInput = {
  categoryId: number;
  title: string;
  content: string;
  slug?: string;
  summary?: string;
  thumbnail?: string;
  status?: PostStatus;
  seoTitle?: string;
  seoDescription?: string;
  tagIds?: number[];
};
