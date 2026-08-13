/**
 * Convert all CDN images to triple WebP (full + resize:1000 + resize:500),
 * rewrite DB URLs to full `.webp`, then delete old jpg/png objects.
 *
 * Usage:
 *   DRY_RUN=1 pnpm run prisma:migrate-cdn-webp
 *   pnpm run prisma:migrate-cdn-webp
 */
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import {
  buildTripleWebp,
  keysFromStem,
  stemFromKeyOrUrl,
} from '../src/common/utils/image-webp';

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const CDN_HOST = (process.env.R2_PUBLIC_URL || 'https://cdn.vesmart.vn').replace(
  /\/$/,
  '',
);

type Collected = {
  sourceUrl: string;
  refs: string[];
};

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/^<|>$/g, '');
  if (!trimmed || trimmed.startsWith('data:')) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const u = new URL(trimmed);
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

function isOurCdn(url: string): boolean {
  try {
    return new URL(url).hostname === new URL(CDN_HOST).hostname;
  } catch {
    return url.startsWith(CDN_HOST);
  }
}

function extractContentUrls(content: string | null | undefined): string[] {
  if (!content) return [];
  const found: string[] = [];
  const mdRe = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(content))) found.push(m[1]);
  while ((m = imgRe.exec(content))) found.push(m[1]);
  return found;
}

function keyFromCdnUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\//, '') || null;
  } catch {
    return null;
  }
}

function fullWebpUrlFromStem(stem: string): string {
  return `${CDN_HOST}/${stem}.webp`;
}

function collectMap() {
  const map = new Map<string, Collected>();
  const add = (raw: string | null | undefined, ref: string) => {
    if (!raw) return;
    const url = normalizeUrl(raw);
    if (!url || !isOurCdn(url)) return;
    const existing = map.get(url);
    if (existing) {
      if (!existing.refs.includes(ref)) existing.refs.push(ref);
      return;
    }
    map.set(url, { sourceUrl: url, refs: [ref] });
  };
  return { map, add };
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function createS3(): { s3: S3Client; bucket: string } {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('Missing R2_* env');
  }
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { s3, bucket };
}

async function objectExists(
  s3: S3Client,
  bucket: string,
  key: string,
): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function putWebp(
  s3: S3Client,
  bucket: string,
  key: string,
  buffer: Buffer,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
    }),
  );
}

async function deleteKey(s3: S3Client, bucket: string, key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function main() {
  loadEnvFile();
  const { s3, bucket } = createS3();
  const { map, add } = collectMap();

  const catalog = await prisma.image.findMany({
    where: { deleted_at: null },
    select: { id: true, url: true, r2_key: true },
  });
  for (const img of catalog) {
    add(img.url, `image:${img.id}`);
    if (img.r2_key) add(`${CDN_HOST}/${img.r2_key}`, `image.r2:${img.id}`);
  }

  const products = await prisma.product.findMany({
    where: { deleted_at: null },
    select: { id: true, thumbnail: true },
  });
  for (const p of products) add(p.thumbnail, `product.thumbnail:${p.id}`);

  const productImages = await prisma.productImage.findMany({
    where: { deleted_at: null },
    select: { id: true, image_url: true },
  });
  for (const img of productImages) {
    add(img.image_url, `product_image:${img.id}`);
  }

  const variants = await prisma.productVariant.findMany({
    where: { deleted_at: null },
    select: { id: true, image: true },
  });
  for (const v of variants) add(v.image, `variant.image:${v.id}`);

  const brands = await prisma.brand.findMany({
    where: { deleted_at: null },
    select: { id: true, logo: true },
  });
  for (const b of brands) add(b.logo, `brand.logo:${b.id}`);

  const categories = await prisma.category.findMany({
    where: { deleted_at: null },
    select: { id: true, image: true },
  });
  for (const c of categories) add(c.image, `category.image:${c.id}`);

  const forums = await prisma.forum.findMany({
    where: { deleted_at: null },
    select: { id: true, icon: true },
  });
  for (const f of forums) add(f.icon, `forum.icon:${f.id}`);

  const posts = await prisma.post.findMany({
    where: { deleted_at: null },
    select: { id: true, thumbnail: true, content: true },
  });
  for (const post of posts) {
    add(post.thumbnail, `post.thumbnail:${post.id}`);
    for (const u of extractContentUrls(post.content)) {
      add(u, `post.content:${post.id}`);
    }
  }

  const items = [...map.values()];
  console.log(
    `Collected ${items.length} CDN urls (DRY_RUN=${DRY_RUN ? '1' : '0'})`,
  );

  /** stem → full webp url after ensure */
  const stemReady = new Map<string, string>();
  /** oldUrl → full webp url */
  const urlMap = new Map<string, string>();
  const oldKeysToDelete = new Set<string>();

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const stem = stemFromKeyOrUrl(item.sourceUrl);
    if (!stem) {
      console.warn(`SKIP no-stem ${item.sourceUrl}`);
      skip += 1;
      continue;
    }

    const keys = keysFromStem(stem);
    const destUrl = fullWebpUrlFromStem(stem);
    process.stdout.write(
      `[${i + 1}/${items.length}] ${stem.slice(0, 70)}...\n`,
    );

    try {
      if (!stemReady.has(stem)) {
        const hasFull = await objectExists(s3, bucket, keys.fullKey);
        const has1000 = await objectExists(s3, bucket, keys.resize1000Key);
        const has500 = await objectExists(s3, bucket, keys.resize500Key);

        if (hasFull && has1000 && has500) {
          stemReady.set(stem, destUrl);
        } else {
          // Prefer downloading non-resize source if available
          let sourceDownload = item.sourceUrl;
          const rawKey = keyFromCdnUrl(item.sourceUrl);
          if (rawKey && /-resize:(?:500|1000)\.webp$/i.test(rawKey)) {
            // try full webp or original jpg siblings
            const candidates = [
              `${CDN_HOST}/${stem}.webp`,
              `${CDN_HOST}/${stem}.jpg`,
              `${CDN_HOST}/${stem}.jpeg`,
              `${CDN_HOST}/${stem}.png`,
            ];
            for (const c of candidates) {
              try {
                const probe = await fetch(c, { method: 'HEAD' });
                if (probe.ok) {
                  sourceDownload = c;
                  break;
                }
              } catch {
                /* ignore */
              }
            }
          }

          if (DRY_RUN) {
            console.log(
              `  DRY would upload triple from ${sourceDownload.slice(0, 80)}`,
            );
            stemReady.set(stem, destUrl);
          } else {
            const buffer = await download(sourceDownload);
            if (buffer.length > 20 * 1024 * 1024) {
              throw new Error(`Too large: ${buffer.length}`);
            }
            const triple = await buildTripleWebp(buffer);
            await Promise.all([
              putWebp(s3, bucket, keys.fullKey, triple.full.buffer),
              putWebp(s3, bucket, keys.resize1000Key, triple.resize1000.buffer),
              putWebp(s3, bucket, keys.resize500Key, triple.resize500.buffer),
            ]);
            stemReady.set(stem, destUrl);
            console.log(
              `  OK triple ${triple.full.width}x${triple.full.height} full=${triple.full.bytes}b`,
            );
          }
        }
      }

      urlMap.set(item.sourceUrl, destUrl);

      const oldKey = keyFromCdnUrl(item.sourceUrl);
      if (
        oldKey &&
        !oldKey.endsWith('.webp') &&
        !/-resize:(?:500|1000)\.webp$/i.test(oldKey)
      ) {
        oldKeysToDelete.add(oldKey);
      } else if (
        oldKey &&
        /\.(jpe?g|png|gif)$/i.test(oldKey)
      ) {
        oldKeysToDelete.add(oldKey);
      }

      ok += 1;
    } catch (error) {
      fail += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error('FAIL', item.sourceUrl, message);
    }
  }

  console.log(`Upload phase: ok=${ok} skip=${skip} fail=${fail}`);

  if (DRY_RUN) {
    console.log(`DRY_RUN urlMap size=${urlMap.size}, would delete ${oldKeysToDelete.size} old keys`);
    console.log('Sample maps:');
    let n = 0;
    for (const [from, to] of urlMap) {
      if (from !== to) {
        console.log(`  ${from}\n  → ${to}`);
        if (++n >= 5) break;
      }
    }
    return;
  }

  // Rewrite catalog images
  for (const img of catalog) {
    const next = img.url ? urlMap.get(normalizeUrl(img.url) || '') : null;
    const stem = next ? stemFromKeyOrUrl(next) : stemFromKeyOrUrl(img.url);
    if (!next && !stem) continue;
    const fullUrl = next || (stem ? fullWebpUrlFromStem(stem) : null);
    if (!fullUrl) continue;
    const fullKey = stem ? keysFromStem(stem).fullKey : null;
    const data: { url?: string; r2_key?: string; mime?: string } = {};
    if (fullUrl !== img.url) data.url = fullUrl;
    if (fullKey && fullKey !== img.r2_key) data.r2_key = fullKey;
    data.mime = 'image/webp';
    if (Object.keys(data).length) {
      await prisma.image.update({ where: { id: img.id }, data });
    }
  }

  for (const p of products) {
    const next = p.thumbnail ? urlMap.get(normalizeUrl(p.thumbnail) || '') : null;
    if (next && next !== p.thumbnail) {
      await prisma.product.update({
        where: { id: p.id },
        data: { thumbnail: next },
      });
    }
  }
  for (const img of productImages) {
    const next = urlMap.get(normalizeUrl(img.image_url) || '');
    if (next && next !== img.image_url) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { image_url: next },
      });
    }
  }
  for (const v of variants) {
    const next = v.image ? urlMap.get(normalizeUrl(v.image) || '') : null;
    if (next && next !== v.image) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { image: next },
      });
    }
  }
  for (const b of brands) {
    const next = b.logo ? urlMap.get(normalizeUrl(b.logo) || '') : null;
    if (next && next !== b.logo) {
      await prisma.brand.update({
        where: { id: b.id },
        data: { logo: next },
      });
    }
  }
  for (const c of categories) {
    const next = c.image ? urlMap.get(normalizeUrl(c.image) || '') : null;
    if (next && next !== c.image) {
      await prisma.category.update({
        where: { id: c.id },
        data: { image: next },
      });
    }
  }
  for (const f of forums) {
    const next = f.icon ? urlMap.get(normalizeUrl(f.icon) || '') : null;
    if (next && next !== f.icon) {
      await prisma.forum.update({
        where: { id: f.id },
        data: { icon: next },
      });
    }
  }

  for (const post of posts) {
    let content = post.content || '';
    let changed = false;
    for (const [source, dest] of urlMap) {
      if (source === dest) continue;
      if (content.includes(source)) {
        content = content.split(source).join(dest);
        changed = true;
      }
    }
    const thumbNext = post.thumbnail
      ? urlMap.get(normalizeUrl(post.thumbnail) || '')
      : null;
    const data: { thumbnail?: string; content?: string } = {};
    if (thumbNext && thumbNext !== post.thumbnail) data.thumbnail = thumbNext;
    if (changed) data.content = content;
    if (Object.keys(data).length) {
      await prisma.post.update({ where: { id: post.id }, data });
    }
  }

  console.log(`Rewrote DB. Deleting ${oldKeysToDelete.size} old objects...`);
  let deleted = 0;
  for (const key of oldKeysToDelete) {
    // Never delete webp variants
    if (/\.webp$/i.test(key)) continue;
    try {
      await deleteKey(s3, bucket, key);
      deleted += 1;
    } catch (error) {
      console.warn('delete fail', key, error);
    }
  }
  console.log(`Deleted ${deleted} old jpg/png/gif keys. DONE.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
