import { apiGetListSafe, apiPost } from "@/lib/api/client";
import type { TagSummary } from "@/types/tag";

export async function listTags(params: { search?: string; limit?: number } = {}): Promise<TagSummary[]> {
  return apiGetListSafe<TagSummary>("/tags", {
    query: {
      page: 1,
      limit: params.limit ?? 50,
      search: params.search,
      sort: "name:asc",
    },
  });
}

export async function createTag(input: {
  name: string;
  slug?: string;
}): Promise<TagSummary> {
  return apiPost<TagSummary>("/tags", {
    auth: true,
    body: {
      name: input.name.trim(),
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}
