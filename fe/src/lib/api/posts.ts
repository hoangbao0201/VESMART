import {
  apiGet,
  apiGetListSafe,
  apiGetPageSafe,
  apiGetSafe,
  apiPatch,
  apiPost,
} from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type {
  PostCategorySummary,
  PostDetail,
  PostListItem,
  PostStatus,
  UpsertPostInput,
} from "@/types/post";

export type ListPostsParams = {
  page?: number;
  limit?: number;
  categorySlug?: string;
  search?: string;
  sort?: string;
};

export async function listPosts(params: ListPostsParams = {}): Promise<PostListItem[]> {
  return apiGetListSafe<PostListItem>("/posts", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 6,
      categorySlug: params.categorySlug,
      search: params.search,
      sort: params.sort ?? "published_at:desc",
      status: "PUBLISHED",
    },
  });
}

export async function listPostsPage(
  params: ListPostsParams = {},
): Promise<PaginatedData<PostListItem>> {
  return apiGetPageSafe<PostListItem>("/posts", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      categorySlug: params.categorySlug,
      search: params.search,
      sort: params.sort ?? "published_at:desc",
      status: "PUBLISHED",
    },
    emptyPage: params.page ?? 1,
    emptyLimit: params.limit ?? 12,
  });
}

export async function listLatestPosts(limit = 6): Promise<PostListItem[]> {
  return listPosts({ limit, sort: "published_at:desc" });
}

/** Same category first, then fill with latest - excludes current post. */
export async function listRelatedPosts(options: {
  postId: number;
  categorySlug?: string | null;
  limit?: number;
}): Promise<PostListItem[]> {
  const limit = options.limit ?? 3;
  const related: PostListItem[] = [];
  const seen = new Set<number>([options.postId]);

  if (options.categorySlug) {
    const byCategory = await listPosts({
      categorySlug: options.categorySlug,
      limit: limit + 2,
      sort: "published_at:desc",
    });
    for (const item of byCategory) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      related.push(item);
      if (related.length >= limit) return related;
    }
  }

  if (related.length < limit) {
    const latest = await listPosts({
      limit: limit + 4,
      sort: "published_at:desc",
    });
    for (const item of latest) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      related.push(item);
      if (related.length >= limit) break;
    }
  }

  return related;
}

export async function listPostCategories(): Promise<PostCategorySummary[]> {
  return apiGetListSafe<PostCategorySummary>("/post-categories", {
    query: {
      limit: 100,
      sort: "sort_order:asc",
    },
  });
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return apiGetSafe<PostDetail>(`/posts/${encodeURIComponent(slug)}`, {
    revalidate: 60,
  });
}

/** Staff edit - no view increment. */
export async function getPostById(id: string | number): Promise<PostDetail | null> {
  return apiGetSafe<PostDetail>(`/posts/id/${encodeURIComponent(String(id))}`, {
    auth: true,
    revalidate: false,
  });
}

export async function createPost(input: UpsertPostInput): Promise<PostDetail> {
  return apiPost<PostDetail>("/posts", {
    auth: true,
    body: input,
  });
}

export async function updatePost(
  id: string | number,
  input: Partial<UpsertPostInput>,
): Promise<PostDetail> {
  return apiPatch<PostDetail>(`/posts/${encodeURIComponent(String(id))}`, {
    auth: true,
    body: input,
  });
}

/** Admin list - all statuses unless filtered. */
export async function listPostsAdmin(params: {
  page?: number;
  limit?: number;
  status?: PostStatus;
} = {}): Promise<PostListItem[]> {
  const data = await apiGet<PaginatedData<PostListItem> | PostListItem[]>("/posts", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: "created_at:desc",
      ...(params.status ? { status: params.status } : {}),
    },
    auth: true,
    revalidate: false,
  });
  return Array.isArray(data) ? data : (data.items ?? []);
}
