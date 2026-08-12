export type MediaImageCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  children?: MediaImageCategory[];
};

export type MediaImage = {
  id: number;
  categoryId: number;
  url: string;
  r2Key: string;
  description: string | null;
  sourceUrl: string | null;
  mime: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  createdAt?: string;
  category?: MediaImageCategory;
};
