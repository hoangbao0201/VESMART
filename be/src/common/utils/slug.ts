import slugify from 'slugify';

const SLUG_MAX = 220;
/** Trailing numeric id: `review-dreame-12`. */
const ID_SUFFIX_RE = /-(\d+)$/;

export function makeSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

/** Strip a trailing `-{id}` from a slug. */
export function stripIdSuffix(slug: string, id?: number | string): string {
  if (!slug) return '';
  if (id !== undefined && id !== null && slug.endsWith(`-${id}`)) {
    return slug.slice(0, -(String(id).length + 1));
  }
  return slug.replace(ID_SUFFIX_RE, '');
}

/** Final public slug: `{base}-{id}` (fits VarChar(220)). */
export function withIdSuffix(baseSlug: string, id: number | string): string {
  const idStr = String(id);
  const cleaned = stripIdSuffix(baseSlug, id).replace(/-+$/g, '');
  const maxBase = SLUG_MAX - idStr.length - 1;
  const base = (cleaned || 'item').slice(0, maxBase).replace(/-+$/g, '') || 'item';
  return `${base}-${idStr}`;
}

/** Extract trailing numeric id from `/blog/{slug}-{id}` style URLs. */
export function extractIdFromSlug(slug: string): number | null {
  const match = slug.match(ID_SUFFIX_RE);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** True when slug already uses `{base}-{intId}` for this entity. */
export function hasEntityIdSuffix(slug: string, id: number | string): boolean {
  return Boolean(slug) && slug.endsWith(`-${id}`);
}

/**
 * Mongo ObjectId (24 hex) product SEO slugs, or plain blog slugs without int id.
 * Keep these intact on update so indexed URLs are not rewritten.
 */
export function isLegacySeoSlug(slug: string, entityId: number | string): boolean {
  if (!slug) return false;
  if (hasEntityIdSuffix(slug, entityId)) return false;
  return true;
}
