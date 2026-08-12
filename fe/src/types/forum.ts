import type { TagSummary } from "@/types/tag";

export type ForumSummary = {
  id: number;
  name: string;
  slug: string;
};

export type UserSummary = {
  id: number;
  username: string;
  avatar: string | null;
};

export type ThreadListItem = {
  id: number;
  slug: string;
  title: string;
  views: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  lastReplyAt: string | null;
  createdAt: string;
  forum?: ForumSummary | null;
  user?: UserSummary | null;
  lastReplyUser?: UserSummary | null;
};

export type ForumListItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  threadCount: number;
  postCount: number;
  sortOrder: number;
  lastThread?: {
    id: number;
    slug: string;
    title: string;
  } | null;
};

export type ForumCategoryItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  forums: ForumListItem[];
};

export type ForumDetail = ForumListItem & {
  seoTitle: string | null;
  seoDescription: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type ForumPostItem = {
  id: number;
  content: string;
  createdAt: string;
  editedAt: string | null;
  replyToPostId: number | null;
  user?: UserSummary | null;
};

export type ThreadDetail = ThreadListItem & {
  content: string;
  status: "OPEN" | "CLOSED" | "HIDDEN" | "DELETED";
  seoTitle: string | null;
  seoDescription: string | null;
  tags?: TagSummary[];
  posts?: ForumPostItem[];
};
