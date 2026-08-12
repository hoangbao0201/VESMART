import { apiGet, apiGetSafe } from "@/lib/api/client";
import type { PaginatedData } from "@/types/api";
import type { UserProfile } from "@/types/user";

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  return apiGetSafe<UserProfile>(
    `/users/username/${encodeURIComponent(username)}`,
    {
      revalidate: 60,
    },
  );
}

/** ADMIN only. */
export async function listUsersAdmin(params: {
  page?: number;
  limit?: number;
} = {}): Promise<UserProfile[]> {
  const data = await apiGet<PaginatedData<UserProfile> | UserProfile[]>("/users", {
    auth: true,
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: "created_at:desc",
    },
    revalidate: false,
  });
  return Array.isArray(data) ? data : (data.items ?? []);
}
