import type { TargetType } from "@/types/comment";
import type { ProductListItem } from "@/types/product";
import type { PostListItem } from "@/types/post";
import type { ThreadListItem } from "@/types/forum";

export type FavoriteTargetType = Extract<TargetType, "PRODUCT" | "POST" | "THREAD">;

export type FavoriteItem = {
  id: number;
  targetType: FavoriteTargetType;
  targetId: number;
  createdAt: string;
  product?: ProductListItem | null;
  post?: PostListItem | null;
  thread?: ThreadListItem | null;
};
