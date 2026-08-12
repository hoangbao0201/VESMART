import { listProducts } from "@/lib/api/products";
import { listPosts } from "@/lib/api/posts";
import { listThreads } from "@/lib/api/forums";
import type { SearchResults } from "@/types/search";

export async function searchAll(query: string, limit = 8): Promise<SearchResults> {
  const q = query.trim();
  if (!q) {
    return { products: [], posts: [], threads: [] };
  }

  const [products, posts, threads] = await Promise.all([
    listProducts({ search: q, limit, page: 1 }),
    listPosts({ search: q, limit, page: 1 }),
    listThreads({ search: q, limit, page: 1 }),
  ]);

  return { products, posts, threads };
}
