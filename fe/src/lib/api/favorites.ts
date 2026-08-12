import { apiDelete, apiGetListSafe, apiPost } from "@/lib/api/client";
import type { FavoriteItem, FavoriteTargetType } from "@/types/favorite";

export async function listFavorites(): Promise<FavoriteItem[]> {
  return apiGetListSafe<FavoriteItem>("/favorites", {
    auth: true,
    query: {
      page: 1,
      limit: 100,
      sort: "created_at:desc",
    },
    revalidate: false,
  });
}

export async function addFavorite(input: {
  targetType: FavoriteTargetType;
  targetId: string | number;
}): Promise<FavoriteItem> {
  return apiPost<FavoriteItem>("/favorites", {
    auth: true,
    body: {
      targetType: input.targetType,
      targetId: Number(input.targetId),
    },
  });
}

export async function removeFavorite(input: {
  targetType: FavoriteTargetType;
  targetId: string | number;
  favoriteId?: string | number;
}): Promise<void> {
  if (input.favoriteId != null) {
    await apiDelete<null>(`/favorites/${encodeURIComponent(String(input.favoriteId))}`, {
      auth: true,
    });
    return;
  }

  await apiDelete<null>("/favorites", {
    auth: true,
    query: {
      targetType: input.targetType,
      targetId: input.targetId,
    },
  });
}
