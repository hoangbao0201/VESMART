import type { TargetType } from "@/types/comment";

export type ReactionType = "LIKE" | "LOVE" | "HAHA";

export type ReactionTargetType = Extract<TargetType, "FORUM_POST" | "COMMENT">;

export type ReactionSummary = {
  type: ReactionType;
  count: number;
  reacted: boolean;
};

export type ReactionItem = {
  id: number;
  targetType: ReactionTargetType;
  targetId: number;
  reactionType: ReactionType;
  createdAt: string;
};
