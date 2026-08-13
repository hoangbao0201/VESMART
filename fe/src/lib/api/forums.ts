import {
  apiDelete,
  apiGet,
  apiGetListSafe,
  apiGetPageSafe,
  apiGetSafe,
  apiPatch,
  apiPost,
} from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type {
  ForumCategoryItem,
  ForumDetail,
  ForumListItem,
  ForumPostItem,
  ThreadDetail,
  ThreadListItem,
  ThreadStatus,
} from "@/types/forum";

export type ListThreadsParams = {
  page?: number;
  limit?: number;
  forumSlug?: string;
  forumId?: string | number;
  search?: string;
  sort?: string;
  status?: ThreadStatus;
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
      auth: true,
    },
  );
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function createForumCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
}): Promise<ForumCategoryItem> {
  return apiPost<ForumCategoryItem>("/forum-categories", {
    auth: true,
    body: {
      name: input.name,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
      ...(input.description?.trim() ? { description: input.description.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });
}

export async function updateForumCategory(
  id: number,
  input: {
    name?: string;
    slug?: string;
    description?: string | null;
    sortOrder?: number;
  },
): Promise<ForumCategoryItem> {
  return apiPatch<ForumCategoryItem>(`/forum-categories/${id}`, {
    auth: true,
    body: input,
  });
}

export async function deleteForumCategory(id: number): Promise<void> {
  await apiDelete(`/forum-categories/${id}`, { auth: true });
}

export async function createForum(input: {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}): Promise<ForumListItem> {
  return apiPost<ForumListItem>("/forums", {
    auth: true,
    body: {
      categoryId: input.categoryId,
      name: input.name,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
      ...(input.description?.trim() ? { description: input.description.trim() } : {}),
      ...(input.icon?.trim() ? { icon: input.icon.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });
}

export async function updateForum(
  id: number,
  input: {
    categoryId?: number;
    name?: string;
    slug?: string;
    description?: string | null;
    icon?: string | null;
    sortOrder?: number;
  },
): Promise<ForumListItem> {
  return apiPatch<ForumListItem>(`/forums/${id}`, {
    auth: true,
    body: input,
  });
}

export async function deleteForum(id: number): Promise<void> {
  await apiDelete(`/forums/${id}`, { auth: true });
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
      status: params.status,
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
      status: params.status,
    },
    emptyPage: params.page ?? 1,
    emptyLimit: params.limit ?? 20,
  });
}

export async function listThreadsAdmin(
  params: ListThreadsParams = {},
): Promise<PaginatedData<ThreadListItem>> {
  const data = await apiGet<PaginatedData<ThreadListItem> | ThreadListItem[]>("/admin/threads", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 30,
      forumSlug: params.forumSlug,
      forumId: params.forumId,
      search: params.search,
      sort: params.sort ?? "last_reply_at:desc",
      status: params.status,
    },
    auth: true,
    revalidate: false,
  });
  if (Array.isArray(data)) {
    return {
      items: data,
      meta: {
        page: params.page ?? 1,
        limit: params.limit ?? 30,
        total: data.length,
        totalPages: 1,
      },
    };
  }
  return data;
}

export async function listHotThreads(limit = 8): Promise<ThreadListItem[]> {
  return listThreads({ limit, sort: "last_reply_at:desc" });
}

export async function getThreadBySlug(slug: string): Promise<ThreadDetail | null> {
  return apiGetSafe<ThreadDetail>(`/threads/${encodeURIComponent(slug)}`, {
    revalidate: 30,
  });
}

export async function createThread(input: {
  forumId: number;
  title: string;
  content: string;
  slug?: string;
}): Promise<ThreadDetail> {
  return apiPost<ThreadDetail>("/threads", {
    auth: true,
    body: {
      forumId: input.forumId,
      title: input.title,
      content: input.content,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}

export async function updateThread(
  id: number,
  input: {
    title?: string;
    content?: string;
    isPinned?: boolean;
    isLocked?: boolean;
    status?: ThreadStatus;
  },
): Promise<ThreadDetail> {
  return apiPatch<ThreadDetail>(`/threads/${id}`, {
    auth: true,
    body: input,
  });
}

export async function deleteThread(id: number): Promise<void> {
  await apiDelete(`/threads/${id}`, { auth: true });
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

export async function listForumPostsAdmin(params: {
  page?: number;
  limit?: number;
  threadId?: number;
  search?: string;
  sort?: string;
} = {}): Promise<PaginatedData<ForumPostItem>> {
  const data = await apiGet<PaginatedData<ForumPostItem> | ForumPostItem[]>("/admin/forum-posts", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 40,
      threadId: params.threadId,
      search: params.search,
      sort: params.sort ?? "created_at:desc",
    },
    auth: true,
    revalidate: false,
  });
  if (Array.isArray(data)) {
    return {
      items: data,
      meta: {
        page: params.page ?? 1,
        limit: params.limit ?? 40,
        total: data.length,
        totalPages: 1,
      },
    };
  }
  return data;
}

export async function createForumPost(
  threadId: number,
  input: { content: string; replyToPostId?: number },
): Promise<ForumPostItem> {
  return apiPost<ForumPostItem>(`/threads/${threadId}/posts`, {
    auth: true,
    body: input,
  });
}

export async function updateForumPost(
  id: number,
  input: { content: string },
): Promise<ForumPostItem> {
  return apiPatch<ForumPostItem>(`/forum-posts/${id}`, {
    auth: true,
    body: input,
  });
}

export async function deleteForumPost(id: number): Promise<void> {
  await apiDelete(`/forum-posts/${id}`, { auth: true });
}

export type ForumAutoResult = {
  replyCount: number;
  scrapedComments: number;
  opAuthor: string;
  thread: {
    id: number;
    slug: string;
    title: string;
    content?: string;
  };
};

export async function createForumAuto(input: {
  forumId: number;
  content: string;
  facebookUrl: string;
}): Promise<ForumAutoResult> {
  return apiPost<ForumAutoResult>("/admin/forum-auto", {
    auth: true,
    body: {
      forumId: input.forumId,
      content: input.content,
      facebookUrl: input.facebookUrl,
    },
  });
}
