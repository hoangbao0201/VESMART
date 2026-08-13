import sharp from 'sharp';

export const WEBP_FULL_MAX = 1500;
export const WEBP_RESIZE_1000 = 1000;
export const WEBP_RESIZE_500 = 500;
export const WEBP_QUALITY = 82;

export type WebpVariant = {
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
};

export type TripleWebp = {
  full: WebpVariant;
  resize1000: WebpVariant;
  resize500: WebpVariant;
};

async function toWebpMax(
  input: Buffer,
  maxEdge: number,
): Promise<WebpVariant> {
  const image = sharp(input, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  let pipeline = image;
  if (w > 0 && h > 0 && Math.max(w, h) > maxEdge) {
    pipeline = pipeline.resize({
      width: w >= h ? maxEdge : undefined,
      height: h > w ? maxEdge : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  const buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
  const outMeta = await sharp(buffer).metadata();
  return {
    buffer,
    width: outMeta.width ?? w,
    height: outMeta.height ?? h,
    bytes: buffer.length,
  };
}

/** Build full (≤1500), resize:1000, resize:500 WebP variants. */
export async function buildTripleWebp(input: Buffer): Promise<TripleWebp> {
  const [full, resize1000, resize500] = await Promise.all([
    toWebpMax(input, WEBP_FULL_MAX),
    toWebpMax(input, WEBP_RESIZE_1000),
    toWebpMax(input, WEBP_RESIZE_500),
  ]);
  return { full, resize1000, resize500 };
}

/** Stem key without extension: media/slug/date/uuid */
export function stemFromKeyOrUrl(keyOrUrl: string): string | null {
  try {
    const pathOnly = keyOrUrl.includes('://')
      ? new URL(keyOrUrl).pathname.replace(/^\//, '')
      : keyOrUrl.replace(/^\//, '');
    const cleaned = pathOnly
      .replace(/-resize:(?:500|1000)\.webp$/i, '')
      .replace(/\.(jpe?g|png|webp|gif)$/i, '');
    return cleaned || null;
  } catch {
    return null;
  }
}

export function keysFromStem(stem: string): {
  fullKey: string;
  resize1000Key: string;
  resize500Key: string;
} {
  return {
    fullKey: `${stem}.webp`,
    resize1000Key: `${stem}-resize:1000.webp`,
    resize500Key: `${stem}-resize:500.webp`,
  };
}
