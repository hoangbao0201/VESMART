import { apiGet, apiGetListSafe, apiGetSafe, apiPost } from "@/lib/api/client";

export type CategoryListItem = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export type CategoryTreeNode = CategoryListItem & {
  children?: CategoryTreeNode[];
};

function unwrapItems<T>(data: { items: T[] } | T[]): T[] {
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function listCategories(): Promise<CategoryListItem[]> {
  return apiGetListSafe<CategoryListItem>("/categories", {
    query: {
      limit: 100,
      sort: "sort_order:asc",
    },
  });
}

export async function listCategoriesAdmin(): Promise<CategoryListItem[]> {
  const data = await apiGet<{ items: CategoryListItem[] } | CategoryListItem[]>(
    "/categories",
    {
      query: {
        limit: 100,
        sort: "sort_order:asc",
      },
      revalidate: false,
    },
  );
  return unwrapItems(data);
}

export async function createCategory(input: {
  name: string;
  slug?: string;
}): Promise<CategoryListItem> {
  return apiPost<CategoryListItem>("/categories", {
    auth: true,
    body: {
      name: input.name,
      ...(input.slug?.trim() ? { slug: input.slug.trim() } : {}),
    },
  });
}

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const data = await apiGetSafe<CategoryTreeNode[] | { items: CategoryTreeNode[] }>(
    "/categories/tree",
    { revalidate: false },
  );
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}

/** Flatten tree to options with indentation labels for searchable selects. */
export function flattenCategoryTree(
  nodes: CategoryTreeNode[],
  depth = 0,
): Array<CategoryListItem & { label: string }> {
  const rows: Array<CategoryListItem & { label: string }> = [];
  for (const node of nodes) {
    const indent = depth > 0 ? `${"- ".repeat(depth)}` : "";
    rows.push({
      id: node.id,
      name: node.name,
      slug: node.slug,
      parentId: node.parentId ?? null,
      label: `${indent}${node.name}`,
    });
    if (node.children?.length) {
      rows.push(...flattenCategoryTree(node.children, depth + 1));
    }
  }
  return rows;
}
