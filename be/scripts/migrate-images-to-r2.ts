/**
 * One-shot: scan product/post/brand/category/forum image URLs → R2 → Image catalog → rewrite DB.
 *
 * Usage:
 *   pnpm exec ts-node --project scripts/tsconfig.json scripts/migrate-images-to-r2.ts
 *   DRY_RUN=1 pnpm exec ts-node --project scripts/tsconfig.json scripts/migrate-images-to-r2.ts
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { getImageDimensions } from '../src/common/utils/image-dimensions';

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const CDN_HOST = (process.env.R2_PUBLIC_URL || 'https://cdn.vesmart.vn').replace(
  /\/$/,
  '',
);

const SKIP_HOST_RE =
  /(googleusercontent\.com|gravatar\.com|googleapis\.com\/avatar)/i;

type Bucket = 'product' | 'post';
type Collected = {
  sourceUrl: string;
  bucket: Bucket;
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

function shouldSkip(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    if (SKIP_HOST_RE.test(host)) return true;
    return false;
  } catch {
    return true;
  }
}

function isAlreadyCdn(url: string): boolean {
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

function extFromUrlOrMime(url: string, contentType: string | null): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  if (contentType) {
    const base = contentType.split(';')[0].trim().toLowerCase();
    if (mimeMap[base]) return mimeMap[base];
  }
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).replace('.', '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  } catch {
    /* ignore */
  }
  return 'jpg';
}

async function ensureCategories() {
  let sanPham = await prisma.imageCategory.findFirst({
    where: { slug: 'san-pham', deleted_at: null },
  });
  if (!sanPham) {
    sanPham = await prisma.imageCategory.create({
      data: { name: 'Sản phẩm', slug: 'san-pham', sort_order: 0 },
    });
  }
  let productShare = await prisma.imageCategory.findFirst({
    where: { slug: 'san-pham-chia-se', deleted_at: null },
  });
  if (!productShare) {
    productShare = await prisma.imageCategory.create({
      data: {
        name: 'Chia sẻ',
        slug: 'san-pham-chia-se',
        sort_order: 0,
        parent_id: sanPham.id,
      },
    });
  }

  let robot = await prisma.imageCategory.findFirst({
    where: { slug: 'robot-hut-bui', deleted_at: null },
  });
  if (!robot) {
    robot = await prisma.imageCategory.create({
      data: { name: 'Robot hút bụi', slug: 'robot-hut-bui', sort_order: 1 },
    });
  }
  let postShare = await prisma.imageCategory.findFirst({
    where: { slug: 'robot-hut-bui-chia-se', deleted_at: null },
  });
  if (!postShare) {
    postShare = await prisma.imageCategory.create({
      data: {
        name: 'Chia sẻ',
        slug: 'robot-hut-bui-chia-se',
        sort_order: 0,
        parent_id: robot.id,
      },
    });
  }

  return { productShare, postShare };
}

function collectMap() {
  const map = new Map<string, Collected>();
  const add = (raw: string | null | undefined, bucket: Bucket, ref: string) => {
    if (!raw) return;
    const url = normalizeUrl(raw);
    if (!url || shouldSkip(url)) return;
    const existing = map.get(url);
    if (existing) {
      existing.refs.push(ref);
      // Prefer product bucket if both (rare)
      if (bucket === 'product') existing.bucket = 'product';
    } else {
      map.set(url, { sourceUrl: url, bucket, refs: [ref] });
    }
  };
  return { map, add };
}

async function download(url: string): Promise<{
  buffer: Buffer;
  contentType: string | null;
}> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'vesmart-image-migrate/1.0',
      Accept: 'image/*,*/*',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const contentType = res.headers.get('content-type');
  const ab = await res.arrayBuffer();
  return { buffer: Buffer.from(ab), contentType };
}

async function main() {
  loadEnvFile();
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = (process.env.R2_PUBLIC_URL || CDN_HOST).replace(/\/$/, '');

  if (!DRY_RUN && (!accountId || !accessKeyId || !secretAccessKey || !bucket)) {
    throw new Error('Missing R2 env vars');
  }

  const s3 =
    !DRY_RUN && accountId && accessKeyId && secretAccessKey
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId, secretAccessKey },
        })
      : null;

  console.log(DRY_RUN ? 'DRY_RUN=1' : 'LIVE migrate');
  const { productShare, postShare } = await ensureCategories();
  console.log(
    'categories',
    productShare.id,
    productShare.slug,
    postShare.id,
    postShare.slug,
  );

  const { map, add } = collectMap();

  const products = await prisma.product.findMany({
    where: { deleted_at: null },
    select: { id: true, thumbnail: true },
  });
  for (const p of products) {
    add(p.thumbnail, 'product', `product.thumbnail:${p.id}`);
  }

  const productImages = await prisma.productImage.findMany({
    where: { deleted_at: null },
    select: { id: true, image_url: true },
  });
  for (const img of productImages) {
    add(img.image_url, 'product', `product_image:${img.id}`);
  }

  const variants = await prisma.productVariant.findMany({
    where: { deleted_at: null },
    select: { id: true, image: true },
  });
  for (const v of variants) {
    add(v.image, 'product', `variant.image:${v.id}`);
  }

  const brands = await prisma.brand.findMany({
    where: { deleted_at: null },
    select: { id: true, logo: true },
  });
  for (const b of brands) {
    add(b.logo, 'product', `brand.logo:${b.id}`);
  }

  const categories = await prisma.category.findMany({
    where: { deleted_at: null },
    select: { id: true, image: true },
  });
  for (const c of categories) {
    add(c.image, 'product', `category.image:${c.id}`);
  }

  const forums = await prisma.forum.findMany({
    where: { deleted_at: null },
    select: { id: true, icon: true },
  });
  for (const f of forums) {
    add(f.icon, 'product', `forum.icon:${f.id}`);
  }

  const posts = await prisma.post.findMany({
    where: { deleted_at: null },
    select: { id: true, thumbnail: true, content: true },
  });
  for (const post of posts) {
    add(post.thumbnail, 'post', `post.thumbnail:${post.id}`);
    for (const u of extractContentUrls(post.content)) {
      add(u, 'post', `post.content:${post.id}`);
    }
  }

  const items = [...map.values()];
  console.log('unique urls', items.length);

  const urlMap = new Map<string, string>(); // source -> cdn
  const logRows: string[] = [
    'source_url,new_url,bucket,category_slug,status,error,refs',
  ];

  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const category =
      item.bucket === 'product' ? productShare : postShare;
    process.stdout.write(
      `[${i + 1}/${items.length}] ${item.bucket} ${item.sourceUrl.slice(0, 80)}...\n`,
    );

    try {
      // Already on our CDN as catalog url
      const existingByUrl = await prisma.image.findFirst({
        where: { url: item.sourceUrl, deleted_at: null },
      });
      if (existingByUrl) {
        urlMap.set(item.sourceUrl, existingByUrl.url);
        logRows.push(
          csv([
            item.sourceUrl,
            existingByUrl.url,
            item.bucket,
            category.slug,
            'exists-url',
            '',
            item.refs.join('|'),
          ]),
        );
        skipped += 1;
        continue;
      }

      // Already catalogued by original source
      const existing = await prisma.image.findFirst({
        where: { source_url: item.sourceUrl, deleted_at: null },
      });
      if (existing) {
        urlMap.set(item.sourceUrl, existing.url);
        logRows.push(
          csv([
            item.sourceUrl,
            existing.url,
            item.bucket,
            category.slug,
            'exists',
            '',
            item.refs.join('|'),
          ]),
        );
        skipped += 1;
        continue;
      }

      // Already on CDN but no Image row — register only
      if (isAlreadyCdn(item.sourceUrl)) {
        const keyGuess = item.sourceUrl.replace(`${publicUrl}/`, '');
        if (!DRY_RUN) {
          const created = await prisma.image.create({
            data: {
              url: item.sourceUrl,
              r2_key: keyGuess,
              source_url: item.sourceUrl,
              category_id: category.id,
              description: null,
            },
          });
          urlMap.set(item.sourceUrl, created.url);
        } else {
          urlMap.set(item.sourceUrl, item.sourceUrl);
        }
        logRows.push(
          csv([
            item.sourceUrl,
            item.sourceUrl,
            item.bucket,
            category.slug,
            'cdn-register',
            '',
            item.refs.join('|'),
          ]),
        );
        ok += 1;
        continue;
      }

      if (DRY_RUN) {
        const fake = `${publicUrl}/media/${category.slug}/dry/${createHash('sha1').update(item.sourceUrl).digest('hex').slice(0, 12)}.jpg`;
        urlMap.set(item.sourceUrl, fake);
        logRows.push(
          csv([
            item.sourceUrl,
            fake,
            item.bucket,
            category.slug,
            'dry-run',
            '',
            item.refs.join('|'),
          ]),
        );
        ok += 1;
        continue;
      }

      const { buffer, contentType } = await download(item.sourceUrl);
      if (buffer.length > 15 * 1024 * 1024) {
        throw new Error(`File too large: ${buffer.length} bytes`);
      }
      const ext = extFromUrlOrMime(item.sourceUrl, contentType);
      const mime = contentType?.split(';')[0].trim() || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const key = `media/${category.slug}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

      await s3!.send(
        new PutObjectCommand({
          Bucket: bucket!,
          Key: key,
          Body: buffer,
          ContentType: mime,
        }),
      );
      const newUrl = `${publicUrl}/${key}`;
      const dims = getImageDimensions(buffer);
      await prisma.image.create({
        data: {
          url: newUrl,
          r2_key: key,
          source_url: item.sourceUrl,
          mime,
          bytes: buffer.length,
          width: dims.width,
          height: dims.height,
          category_id: category.id,
        },
      });
      urlMap.set(item.sourceUrl, newUrl);
      logRows.push(
        csv([
          item.sourceUrl,
          newUrl,
          item.bucket,
          category.slug,
          'ok',
          '',
          item.refs.join('|'),
        ]),
      );
      ok += 1;
    } catch (error) {
      fail += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error('FAIL', item.sourceUrl, message);
      logRows.push(
        csv([
          item.sourceUrl,
          '',
          item.bucket,
          category.slug,
          'fail',
          message,
          item.refs.join('|'),
        ]),
      );
    }
  }

  // Rewrite entity URLs
  if (!DRY_RUN) {
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
      let content = post.content;
      let changed = false;
      for (const [source, dest] of urlMap) {
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
  }

  const outDir = path.join(__dirname);
  const csvPath = path.join(outDir, 'migrate-images-to-r2.log.csv');
  fs.writeFileSync(csvPath, logRows.join('\n'), 'utf8');
  console.log('done ok=', ok, 'fail=', fail, 'skipped=', skipped);
  console.log('log', csvPath);
}

function csv(cols: string[]): string {
  return cols
    .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
    .join(',');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
