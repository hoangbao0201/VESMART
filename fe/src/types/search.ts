import type { ProductListItem } from "@/types/product";
import type { PostListItem } from "@/types/post";
import type { ThreadListItem } from "@/types/forum";

export type SearchResults = {
  products: ProductListItem[];
  posts: PostListItem[];
  threads: ThreadListItem[];
};
