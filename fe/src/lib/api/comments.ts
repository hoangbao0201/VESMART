import { apiGet, apiGetListSafe, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type { CommentItem, CommentStatus, TargetType } from "@/types/comment";

export type ListCommentsParams = {
  targetType: Extract<TargetType, "PRODUCT" | "POST">;
  targetId: string | number;
  page?: number;
  limit?: number;
};

export async function listComments(params: ListCommentsParams): Promise<CommentItem[]> {
  return apiGetListSafe<CommentItem>("/comments", {
    query: {
      target_type: params.targetType,
      targetType: params.targetType,
      target_id: params.targetId,
      targetId: params.targetId,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      status: "APPROVED",
      sort: "created_at:asc",
    },
    revalidate: false,
  });
}

export async function createComment(input: {
  targetType: Extract<TargetType, "PRODUCT" | "POST">;
  targetId: string | number;
  content: string;
  parentId?: string | number;
}): Promise<CommentItem> {
  return apiPost<CommentItem>("/comments", {
    auth: true,
    body: {
      targetType: input.targetType,
      targetId: Number(input.targetId),
      content: input.content,
      parentId: input.parentId != null ? Number(input.parentId) : undefined,
    },
  });
}

export async function listCommentsByStatus(
  status: CommentStatus,
  params: { page?: number; limit?: number } = {},
): Promise<CommentItem[]> {
  const data = await apiGet<PaginatedData<CommentItem> | CommentItem[]>("/comments", {
    query: {
      status,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: "created_at:desc",
    },
    revalidate: false,
  });
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function updateCommentStatus(
  id: string | number,
  status: Extract<CommentStatus, "APPROVED" | "REJECTED" | "SPAM" | "PENDING">,
): Promise<CommentItem> {
  return apiPatch<CommentItem>(`/comments/${encodeURIComponent(String(id))}/status`, {
    auth: true,
    body: { status },
  });
}
