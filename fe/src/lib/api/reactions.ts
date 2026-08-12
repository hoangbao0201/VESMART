import { apiDelete, apiGetSafe, apiPost } from "@/lib/api/client";
import type { ReactionItem, ReactionSummary, ReactionTargetType, ReactionType } from "@/types/reaction";

export async function listReactionSummary(input: {
  targetType: ReactionTargetType;
  targetId: string | number;
}): Promise<ReactionSummary[]> {
  const data = await apiGetSafe<ReactionSummary[] | { items: ReactionSummary[] }>("/reactions", {
    query: {
      targetType: input.targetType,
      target_type: input.targetType,
      targetId: input.targetId,
      target_id: input.targetId,
      summary: true,
    },
    auth: true,
    revalidate: false,
  });

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export async function addReaction(input: {
  targetType: ReactionTargetType;
  targetId: string | number;
  reactionType: ReactionType;
}): Promise<ReactionItem> {
  return apiPost<ReactionItem>("/reactions", {
    auth: true,
    body: {
      targetType: input.targetType,
      targetId: Number(input.targetId),
      reactionType: input.reactionType,
    },
  });
}

export async function removeReaction(input: {
  targetType: ReactionTargetType;
  targetId: string | number;
  reactionType: ReactionType;
}): Promise<void> {
  await apiDelete<null>("/reactions", {
    auth: true,
    query: {
      targetType: input.targetType,
      target_type: input.targetType,
      targetId: input.targetId,
      target_id: input.targetId,
      reactionType: input.reactionType,
      reaction_type: input.reactionType,
    },
  });
}
