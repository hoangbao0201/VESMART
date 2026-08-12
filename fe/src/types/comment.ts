import type { UserSummary } from "@/types/forum";

export type TargetType = "PRODUCT" | "POST" | "THREAD" | "FORUM_POST" | "COMMENT";

export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";

export type CommentItem = {
  id: number;
  parentId: number | null;
  targetType: TargetType;
  targetId: number;
  content: string;
  status: CommentStatus;
  createdAt: string;
  user?: UserSummary | null;
  children?: CommentItem[];
};
