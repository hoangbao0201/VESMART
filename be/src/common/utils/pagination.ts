export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export function buildMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}

export function parseSort(
  sort: string | undefined,
  allowed: string[],
  fallback: { field: string; direction: 'asc' | 'desc' },
): Record<string, 'asc' | 'desc'> {
  if (!sort) return { [fallback.field]: fallback.direction };
  const [rawField, rawDir] = sort.split(':');
  const field = allowed.includes(rawField) ? rawField : fallback.field;
  const direction =
    rawDir === 'asc' || rawDir === 'desc' ? rawDir : fallback.direction;
  return { [field]: direction };
}
