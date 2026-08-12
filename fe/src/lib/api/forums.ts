import { apiGet, apiGetListSafe, apiGetPageSafe, apiGetSafe, apiPost } from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type {
  ForumCategoryItem,
  ForumDetail,
  ForumPostItem,
  ThreadDetail,
  ThreadListItem,
} from "@/types/forum";

export type ListThreadsParams = {
  page?: number;
  limit?: number;
  forumSlug?: string;
  forumId?: string | number;
  search?: string;
  sort?: string;
};

export async function listForumCategories(): Promise<ForumCategoryItem[]> {
  return apiGetListSafe<ForumCategoryItem>("/forum-categories", {
    query: {
      limit: 100,
      sort: "sort_order:asc",
      includeForums: true,
    },
  });
}

export async function listForumCategoriesAdmin(): Promise<ForumCategoryItem[]> {
  const data = await apiGet<{ items: ForumCategoryItem[] } | ForumCategoryItem[]>(
    "/forum-categories",
    {
      query: {
        limit: 100,
        sort: "sort_order:asc",
        includeForums: true,
      },
      revalidate: false,
    },
  );
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function createForumCategory(input: {
  name: string;
  slug?: string;
}): Promise<ForumCategoryItem> {
  return apiPost<ForumCategoryItem>("/forum-categories", {
    auth: true,
    body: {
      name: input.name,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}

export async function getForumBySlug(slug: string): Promise<ForumDetail | null> {
  return apiGetSafe<ForumDetail>(`/forums/${encodeURIComponent(slug)}`, {
    revalidate: 60,
  });
}

export async function listThreads(params: ListThreadsParams = {}): Promise<ThreadListItem[]> {
  return apiGetListSafe<ThreadListItem>("/threads", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 8,
      forumSlug: params.forumSlug,
      forumId: params.forumId,
      search: params.search,
      sort: params.sort ?? "last_reply_at:desc",
    },
  });
}

export async function listThreadsPage(
  params: ListThreadsParams = {},
): Promise<PaginatedData<ThreadListItem>> {
  return apiGetPageSafe<ThreadListItem>("/threads", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      forumSlug: params.forumSlug,
      forumId: params.forumId,
      search: params.search,
      sort: params.sort ?? "last_reply_at:desc",
    },
    emptyPage: params.page ?? 1,
    emptyLimit: params.limit ?? 20,
  });
}

export async function listHotThreads(limit = 8): Promise<ThreadListItem[]> {
  return listThreads({ limit, sort: "last_reply_at:desc" });
}

export async function getThreadBySlug(slug: string): Promise<ThreadDetail | null> {
  return apiGetSafe<ThreadDetail>(`/threads/${encodeURIComponent(slug)}`, {
    revalidate: 30,
  });
}

export async function listThreadPosts(
  threadId: string | number,
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedData<ForumPostItem>> {
  return apiGetPageSafe<ForumPostItem>(`/threads/${encodeURIComponent(String(threadId))}/posts`, {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: "created_at:asc",
    },
    emptyPage: params.page ?? 1,
    emptyLimit: params.limit ?? 50,
  });
}
