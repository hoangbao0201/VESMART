import { apiGet, apiGetListSafe, apiPost } from "@/lib/api/client";

export type BrandListItem = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

function unwrapItems<T>(data: { items: T[] } | T[]): T[] {
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function listBrands(): Promise<BrandListItem[]> {
  return apiGetListSafe<BrandListItem>("/brands", {
    query: {
      limit: 100,
      sort: "sort_order:asc",
    },
  });
}

/** Admin/client list - no cache, surfaces API errors. */
export async function listBrandsAdmin(): Promise<BrandListItem[]> {
  const data = await apiGet<{ items: BrandListItem[] } | BrandListItem[]>("/brands", {
    query: {
      limit: 100,
      sort: "sort_order:asc",
    },
    revalidate: false,
  });
  return unwrapItems(data);
}

export async function createBrand(input: {
  name: string;
  slug?: string;
}): Promise<BrandListItem> {
  return apiPost<BrandListItem>("/brands", {
    auth: true,
    body: {
      name: input.name,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}
