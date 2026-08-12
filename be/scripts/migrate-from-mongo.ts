/**
 * Migrate SEO content from legacy MongoDB (project *) into Postgres (be Prisma).
 *
 * Usage:
 *   pnpm prisma:migrate-mongo
 *   pnpm prisma:migrate-mongo -- --dry-run
 *
 * Env:
 *   SOURCE_MONGODB_URL  Mongo connection (legacy)
 *   DATABASE_URL        Postgres (Prisma)
 */
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { MongoClient, ObjectId, type Document } from 'mongodb';
import {
  PostStatus,
  PrismaClient,
  ProductStatus,
  UserRole,
  VariantStatus,
} from '@prisma/client';
import slugify from 'slugify';

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const dryRun = process.argv.includes('--dry-run');
const reportPath = path.join(__dirname, 'migrate-report.json');
const feRedirectsPath = path.join(
  __dirname,
  '..',
  '..',
  'fe',
  'legacy-seo-redirects.json',
);

type SeoRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

type Report = {
  dryRun: boolean;
  startedAt: string;
  finishedAt?: string;
  counts: Record<string, number>;
  samples: {
    posts: Array<{
      legacySlug: string;
      slug: string;
      title: string;
      id: number;
    }>;
    products: Array<{
      legacyPath: string;
      slug: string;
      name: string;
      id: number;
    }>;
  };
  redirects: SeoRedirect[];
  skipped: string[];
  errors: string[];
};

const report: Report = {
  dryRun,
  startedAt: new Date().toISOString(),
  counts: {},
  samples: { posts: [], products: [] },
  redirects: [],
  skipped: [],
  errors: [],
};

function bump(key: string, n = 1) {
  report.counts[key] = (report.counts[key] ?? 0) + n;
}

function makeSlug(input: string): string {
  const normalized = (input || 'item')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
  return (
    slugify(normalized, {
      lower: true,
      strict: true,
      trim: true,
      locale: 'vi',
    }).slice(0, 200) || 'item'
  );
}

const SLUG_MAX = 220;

/** Public slug rule for new app: `{base}-{intId}`. */
function withIdSuffix(baseSlug: string, id: number): string {
  const idStr = String(id);
  const cleaned = (baseSlug || 'item').replace(/-+$/g, '');
  const maxBase = SLUG_MAX - idStr.length - 1;
  const base = cleaned.slice(0, maxBase).replace(/-+$/g, '') || 'item';
  return `${base}-${idStr}`;
}

function pushRedirect(source: string, destination: string) {
  if (!source || !destination || source === destination) return;
  if (report.redirects.some((r) => r.source === source)) return;
  report.redirects.push({ source, destination, permanent: true });
}

function oid(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof ObjectId) return value.toHexString();
  if (typeof value === 'object' && value !== null && '$oid' in value) {
    return String((value as { $oid: string }).$oid);
  }
  try {
    return String(value);
  } catch {
    return null;
  }
}

function pick<T = unknown>(doc: Document, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (doc[key] !== undefined && doc[key] !== null) return doc[key] as T;
  }
  return undefined;
}

function asDate(value: unknown, fallback = new Date()): Date {
  if (!value) return fallback;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && '$date' in value) {
    return new Date(String((value as { $date: string }).$date));
  }
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function truncate(s: string | null | undefined, max: number): string | null {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;
  return t.length <= max ? t : `${t.slice(0, max - 1).trim()}…`;
}

function detectBrand(name: string): { name: string; slug: string } {
  const lower = name.toLowerCase();
  const brands: Array<[RegExp, string, string]> = [
    [/dreame/i, 'Dreame', 'dreame'],
    [/roborock/i, 'Roborock', 'roborock'],
    [/xiaomi|mijia|mi robot/i, 'Xiaomi', 'xiaomi'],
    [/ecovacs|deebot/i, 'Ecovacs', 'ecovacs'],
    [/eufy/i, 'Eufy', 'eufy'],
    [/samsung/i, 'Samsung', 'samsung'],
    [/lg\b/i, 'LG', 'lg'],
  ];
  for (const [re, n, slug] of brands) {
    if (re.test(lower)) return { name: n, slug };
  }
  return { name: 'Khác', slug: 'khac' };
}

function pickPostCategorySlug(title: string, slug: string): string {
  const hay = `${title} ${slug}`.toLowerCase();
  if (
    hay.includes('sua-chua') ||
    hay.includes('sửa chữa') ||
    hay.includes('sua chua')
  ) {
    return 'sua-chua';
  }
  if (hay.includes('review') || hay.includes('so-sanh') || hay.includes('top-')) {
    return 'reviews';
  }
  return 'huong-dan';
}

async function main() {
  const mongoUrl = process.env.SOURCE_MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('SOURCE_MONGODB_URL is required');
  }

  const prisma = new PrismaClient();
  const mongo = new MongoClient(mongoUrl);

  try {
    await mongo.connect();
    const db = mongo.db();
    console.log(`Mongo DB: ${db.databaseName} (dryRun=${dryRun})`);
    // Keep prisma in outer scope for finally.

    const usersCol = db.collection('users_v2');
    const metasCol = db.collection('metas_v2');
    const postsCol = db.collection('posts_v2');
    const postMetasCol = db.collection('post_metas_v2');
    const postImagesCol = db.collection('post_images_v2');
    const imagesCol = db.collection('images_v2');
    const productsCol = db.collection('products_v2');
    const productImagesCol = db.collection('product_images_v2');
    const productMetasCol = db.collection('product_metas_v2');
    const optionsCol = db.collection('product_options_v2');
    const optionValuesCol = db.collection('product_option_values_v2');
    const variantsCol = db.collection('product_variants_v2');
    const variantImagesCol = db.collection('variant_images_v2');
    const variantOptionValuesCol = db.collection('variant_option_values_v2');

    const postCount = await postsCol.countDocuments();
    const productCount = await productsCol.countDocuments();
    console.log(`Source posts_v2=${postCount}, products_v2=${productCount}`);

    // Fallback legacy Blog collection if posts_v2 empty
    const useLegacyBlog = postCount === 0;
    const legacyBlogs = useLegacyBlog
      ? await db.collection('Blog').find({}).toArray()
      : [];
    const legacyHashtags = useLegacyBlog
      ? await db.collection('Hashtag').find({}).toArray()
      : [];
    const legacyBlogHashtags = useLegacyBlog
      ? await db.collection('BlogHashtag').find({}).toArray()
      : [];
    if (useLegacyBlog) {
      console.log(
        `Fallback legacy Blog=${legacyBlogs.length}, Hashtag=${legacyHashtags.length}`,
      );
    }

    if (dryRun) {
      bump('posts_source', useLegacyBlog ? legacyBlogs.length : postCount);
      bump('products_source', productCount);
      report.finishedAt = new Date().toISOString();
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`Dry-run report → ${reportPath}`);
      return;
    }

    const passwordAdmin = await bcrypt.hash('Admin123!', 10);
    const passwordHoang = await bcrypt.hash('baodeptrai199', 10);

    const adminLocal = await prisma.user.upsert({
      where: { email: 'admin@vesmart.local' },
      update: { role: UserRole.ADMIN, password: passwordAdmin },
      create: {
        email: 'admin@vesmart.local',
        username: 'admin',
        password: passwordAdmin,
        full_name: 'Vesmart Admin',
        role: UserRole.ADMIN,
      },
    });
    const adminHoang = await prisma.user.upsert({
      where: { email: 'hoangbao020103@gmail.com' },
      update: {
        role: UserRole.ADMIN,
        password: passwordHoang,
        full_name: 'Hoang Bao',
      },
      create: {
        email: 'hoangbao020103@gmail.com',
        username: 'hoangbao',
        password: passwordHoang,
        full_name: 'Hoang Bao',
        role: UserRole.ADMIN,
      },
    });
    bump('admins', 2);

    const mongoUserToPg = new Map<string, number>();
    const mongoUsers = await usersCol.find({}).toArray();
    for (const u of mongoUsers) {
      const id = oid(u._id);
      const email = pick<string>(u, 'email');
      if (!id || !email) {
        report.skipped.push(`user missing email: ${id}`);
        continue;
      }
      const roleRaw = String(pick(u, 'role') ?? 'guest').toLowerCase();
      const role = roleRaw === 'admin' ? UserRole.ADMIN : UserRole.USER;
      const name = String(pick(u, 'name') ?? email.split('@')[0]);
      const usernameBase = makeSlug(email.split('@')[0]).slice(0, 40) || `user-${id.slice(-6)}`;
      let username = usernameBase;
      let n = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        n += 1;
        username = `${usernameBase}${n}`.slice(0, 50);
      }
      const password =
        typeof pick(u, 'password') === 'string' &&
        String(pick(u, 'password')).startsWith('$2')
          ? String(pick(u, 'password'))
          : await bcrypt.hash(`Reset-${id.slice(-8)}!`, 10);

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        mongoUserToPg.set(id, existing.id);
        bump('users_mapped');
        continue;
      }
      const created = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          password,
          full_name: name,
          role,
        },
      });
      mongoUserToPg.set(id, created.id);
      bump('users_created');
    }
    mongoUserToPg.set('__admin__', adminHoang.id);
    void adminLocal;

    // Catalog stubs
    const productCategory = await prisma.category.upsert({
      where: { slug: 'robot-hut-bui' },
      update: {},
      create: {
        name: 'Robot hút bụi',
        slug: 'robot-hut-bui',
        description: 'Danh mục robot hút bụi',
        sort_order: 1,
      },
    });

    const brandCache = new Map<string, number>();
    async function ensureBrand(slug: string, name: string) {
      const cached = brandCache.get(slug);
      if (cached) return cached;
      const brand = await prisma.brand.upsert({
        where: { slug },
        update: { name },
        create: { name, slug, sort_order: brandCache.size + 1 },
      });
      brandCache.set(slug, brand.id);
      return brand.id;
    }
    await ensureBrand('khac', 'Khác');

    const postCatHuongDan = await prisma.postCategory.upsert({
      where: { slug: 'huong-dan' },
      update: {},
      create: {
        name: 'Hướng dẫn',
        slug: 'huong-dan',
        description: 'Hướng dẫn sử dụng & mẹo',
        sort_order: 1,
      },
    });
    const postCatSuaChua = await prisma.postCategory.upsert({
      where: { slug: 'sua-chua' },
      update: {},
      create: {
        name: 'Sửa chữa',
        slug: 'sua-chua',
        description: 'Sửa chữa robot hút bụi',
        sort_order: 2,
      },
    });
    const postCatReviews = await prisma.postCategory.upsert({
      where: { slug: 'reviews' },
      update: {},
      create: {
        name: 'Reviews',
        slug: 'reviews',
        description: 'Review & so sánh',
        sort_order: 3,
      },
    });
    const postCatBySlug: Record<string, number> = {
      'huong-dan': postCatHuongDan.id,
      'sua-chua': postCatSuaChua.id,
      reviews: postCatReviews.id,
    };

    // Tags from metas_v2
    const mongoMetaToTag = new Map<string, number>();
    const metas = await metasCol.find({}).toArray();
    for (const meta of metas) {
      const id = oid(meta._id);
      const name = String(pick(meta, 'name') ?? '').trim();
      if (!id || !name) continue;
      const slug = makeSlug(name).slice(0, 120);
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      mongoMetaToTag.set(id, tag.id);
      bump('tags');
    }

    // Legacy hashtags
    const legacyHashtagToTag = new Map<string, number>();
    for (const h of legacyHashtags) {
      const id = oid(h._id);
      const name = String(h.name ?? h.title ?? '').trim();
      if (!id || !name) continue;
      const slug = makeSlug(name).slice(0, 120);
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      legacyHashtagToTag.set(id, tag.id);
      bump('tags_legacy');
    }

    const imageUrlById = new Map<string, string>();
    const images = await imagesCol.find({}).toArray();
    for (const img of images) {
      const id = oid(img._id);
      const url = pick<string>(img, 'url');
      if (id && url) imageUrlById.set(id, url);
    }
    bump('images_indexed', imageUrlById.size);

    // ---- Posts ----
    async function findPostByLegacySlug(legacySlug: string) {
      const exact = await prisma.post.findFirst({
        where: { slug: legacySlug, deleted_at: null },
      });
      if (exact) return exact;
      const candidates = await prisma.post.findMany({
        where: {
          deleted_at: null,
          slug: { startsWith: `${legacySlug}-` },
        },
      });
      return (
        candidates.find((p) => p.slug === withIdSuffix(legacySlug, p.id)) ??
        null
      );
    }

    async function upsertPost(input: {
      slug: string;
      title: string;
      content: string;
      description?: string | null;
      thumbnail?: string | null;
      authorId: number;
      createdAt: Date;
      updatedAt: Date;
      tagIds: number[];
    }) {
      if (!input.slug || input.slug === 'your-slug') {
        report.skipped.push(`post placeholder slug: ${input.slug}`);
        return;
      }
      const legacySlug = input.slug.slice(0, SLUG_MAX);
      const catSlug = pickPostCategorySlug(input.title, legacySlug);
      const categoryId = postCatBySlug[catSlug] ?? postCatHuongDan.id;
      const summary = truncate(input.description, 500);
      const existing = await findPostByLegacySlug(legacySlug);

      let postId: number;
      if (existing) {
        const publicSlug = withIdSuffix(legacySlug, existing.id);
        await prisma.post.update({
          where: { id: existing.id },
          data: {
            slug: publicSlug,
            title: input.title,
            content: input.content || existing.content,
            summary: summary ?? existing.summary,
            seo_description: summary ?? existing.seo_description,
            seo_title: truncate(input.title, 255),
            thumbnail: input.thumbnail ?? existing.thumbnail,
            status: PostStatus.PUBLISHED,
            published_at: input.createdAt,
            author_id: input.authorId,
            category_id: categoryId,
          },
        });
        postId = existing.id;
        bump('posts_updated');
      } else {
        const tempSlug = `import-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const created = await prisma.post.create({
          data: {
            slug: tempSlug.slice(0, SLUG_MAX),
            title: input.title.slice(0, 255),
            content: input.content || input.title,
            summary,
            seo_title: truncate(input.title, 255),
            seo_description: summary,
            thumbnail: input.thumbnail,
            status: PostStatus.PUBLISHED,
            published_at: input.createdAt,
            author: { connect: { id: input.authorId } },
            category: { connect: { id: categoryId } },
          },
        });
        postId = created.id;
        await prisma.post.update({
          where: { id: postId },
          data: { slug: withIdSuffix(legacySlug, postId) },
        });
        bump('posts_created');
      }

      const publicSlug = withIdSuffix(legacySlug, postId);
      // Hard redirects: indexed Vietnamese paths → canonical /blog/{base}-{id}
      pushRedirect(`/bai-viet/${legacySlug}`, `/blog/${publicSlug}`);
      if (legacySlug !== publicSlug) {
        pushRedirect(`/blog/${legacySlug}`, `/blog/${publicSlug}`);
      }

      if (input.tagIds.length) {
        await prisma.postTag.updateMany({
          where: { post_id: postId, deleted_at: null },
          data: { deleted_at: new Date() },
        });
        await prisma.postTag.createMany({
          data: input.tagIds.map((tag_id) => ({ post_id: postId, tag_id })),
          skipDuplicates: true,
        });
      }

      if (report.samples.posts.length < 15) {
        report.samples.posts.push({
          legacySlug,
          slug: publicSlug,
          title: input.title,
          id: postId,
        });
      }
    }

    if (!useLegacyBlog) {
      const posts = await postsCol.find({}).toArray();
      const postMetas = await postMetasCol.find({}).toArray();
      const postImages = await postImagesCol.find({}).toArray();

      const tagsByPost = new Map<string, number[]>();
      for (const pm of postMetas) {
        const postId = oid(pick(pm, 'post_id', 'postId'));
        const metaId = oid(pick(pm, 'meta_id', 'metaId'));
        if (!postId || !metaId) continue;
        const tagId = mongoMetaToTag.get(metaId);
        if (!tagId) continue;
        const list = tagsByPost.get(postId) ?? [];
        list.push(tagId);
        tagsByPost.set(postId, list);
      }

      const thumbByPost = new Map<string, string>();
      for (const pi of postImages) {
        const postId = oid(pick(pi, 'post_id', 'postId'));
        const imageId = oid(pick(pi, 'image_id', 'imageId'));
        const index = Number(pick(pi, 'index') ?? 0);
        if (!postId || !imageId) continue;
        const url = imageUrlById.get(imageId);
        if (!url) continue;
        if (!thumbByPost.has(postId) || index === 0) {
          thumbByPost.set(postId, url);
        }
      }

      for (const p of posts) {
        const mongoId = oid(p._id);
        const slug = String(pick(p, 'slug') ?? '');
        const title = String(pick(p, 'title') ?? '');
        const content = String(pick(p, 'content') ?? '');
        const description = pick<string>(p, 'description');
        const userId = oid(pick(p, 'user_id', 'userId'));
        const authorId =
          (userId && mongoUserToPg.get(userId)) || adminHoang.id;
        await upsertPost({
          slug,
          title,
          content,
          description,
          thumbnail: (mongoId && thumbByPost.get(mongoId)) || null,
          authorId,
          createdAt: asDate(pick(p, 'created_at', 'createdAt')),
          updatedAt: asDate(pick(p, 'updated_at', 'updatedAt')),
          tagIds: mongoId ? [...new Set(tagsByPost.get(mongoId) ?? [])] : [],
        });
      }
    } else {
      const tagsByBlog = new Map<string, number[]>();
      for (const row of legacyBlogHashtags) {
        const blogId = oid(pick(row, 'blogId', 'blog_id'));
        const hashtagId = oid(pick(row, 'hashtagId', 'hashtag_id'));
        if (!blogId || !hashtagId) continue;
        const tagId = legacyHashtagToTag.get(hashtagId);
        if (!tagId) continue;
        const list = tagsByBlog.get(blogId) ?? [];
        list.push(tagId);
        tagsByBlog.set(blogId, list);
      }
      for (const b of legacyBlogs) {
        const mongoId = oid(b._id);
        await upsertPost({
          slug: String(b.slug ?? ''),
          title: String(b.title ?? ''),
          content: String(b.content ?? ''),
          description: b.description ? String(b.description) : null,
          thumbnail: b.thumbnail ? String(b.thumbnail) : null,
          authorId: adminHoang.id,
          createdAt: asDate(b.createdAt),
          updatedAt: asDate(b.updatedAt),
          tagIds: mongoId ? [...new Set(tagsByBlog.get(mongoId) ?? [])] : [],
        });
      }
    }

    // ---- Products ----
    const attrCache = new Map<string, number>(); // name -> attribute id
    const attrValueCache = new Map<string, number>(); // attrId:valueSlug -> value id

    async function ensureAttribute(name: string, slug: string) {
      const key = name.trim().toLowerCase();
      const cached = attrCache.get(key);
      if (cached) return cached;
      const attr = await prisma.productAttribute.upsert({
        where: { slug: slug.slice(0, 120) },
        update: { name },
        create: { name, slug: slug.slice(0, 120) },
      });
      attrCache.set(key, attr.id);
      return attr.id;
    }

    async function ensureAttributeValue(
      attributeId: number,
      value: string,
      valueSlug: string,
    ) {
      const key = `${attributeId}:${valueSlug}`;
      const cached = attrValueCache.get(key);
      if (cached) return cached;
      const existing = await prisma.productAttributeValue.findFirst({
        where: { attribute_id: attributeId, slug: valueSlug, deleted_at: null },
      });
      if (existing) {
        attrValueCache.set(key, existing.id);
        return existing.id;
      }
      const created = await prisma.productAttributeValue.create({
        data: {
          value: value.slice(0, 150),
          slug: valueSlug.slice(0, 180),
          attribute: { connect: { id: attributeId } },
        },
      });
      attrValueCache.set(key, created.id);
      return created.id;
    }

    const products = await productsCol.find({}).toArray();
    const productImages = await productImagesCol.find({}).toArray();
    const productMetas = await productMetasCol.find({}).toArray();
    const options = await optionsCol.find({}).toArray();
    const optionValues = await optionValuesCol.find({}).toArray();
    const variants = await variantsCol.find({}).toArray();
    const variantImages = await variantImagesCol.find({}).toArray();
    const variantOptionValues = await variantOptionValuesCol.find({}).toArray();

    const imagesByProduct = new Map<string, Array<{ url: string; index: number }>>();
    for (const pi of productImages) {
      const productId = oid(pick(pi, 'product_id', 'productId'));
      const imageId = oid(pick(pi, 'image_id', 'imageId'));
      const index = Number(pick(pi, 'index') ?? 0);
      if (!productId || !imageId) continue;
      const url = imageUrlById.get(imageId);
      if (!url) continue;
      const list = imagesByProduct.get(productId) ?? [];
      list.push({ url, index });
      imagesByProduct.set(productId, list);
    }

    const tagsByProduct = new Map<string, number[]>();
    for (const pm of productMetas) {
      const productId = oid(pick(pm, 'product_id', 'productId'));
      const metaId = oid(pick(pm, 'meta_id', 'metaId'));
      if (!productId || !metaId) continue;
      const tagId = mongoMetaToTag.get(metaId);
      if (!tagId) continue;
      const list = tagsByProduct.get(productId) ?? [];
      list.push(tagId);
      tagsByProduct.set(productId, list);
    }

    const optionsByProduct = new Map<string, Document[]>();
    for (const opt of options) {
      const productId = oid(pick(opt, 'product_id', 'productId'));
      if (!productId) continue;
      const list = optionsByProduct.get(productId) ?? [];
      list.push(opt);
      optionsByProduct.set(productId, list);
    }

    const valuesByOption = new Map<string, Document[]>();
    for (const val of optionValues) {
      const optionId = oid(pick(val, 'product_option_id', 'productOptionId'));
      if (!optionId) continue;
      const list = valuesByOption.get(optionId) ?? [];
      list.push(val);
      valuesByOption.set(optionId, list);
    }

    // Map mongo optionValueId -> pg attributeValueId (filled while processing options)
    const mongoOptValToPg = new Map<string, number>();

    const variantsByProduct = new Map<string, Document[]>();
    for (const v of variants) {
      const productId = oid(pick(v, 'product_id', 'productId'));
      if (!productId) continue;
      const list = variantsByProduct.get(productId) ?? [];
      list.push(v);
      variantsByProduct.set(productId, list);
    }

    const variantImageByVariant = new Map<string, string>();
    for (const vi of variantImages) {
      const variantId = oid(pick(vi, 'product_variant_id', 'productVariantId'));
      const imageId = oid(pick(vi, 'image_id', 'imageId'));
      if (!variantId || !imageId) continue;
      const url = imageUrlById.get(imageId);
      if (url) variantImageByVariant.set(variantId, url);
    }

    const optValsByVariant = new Map<string, string[]>();
    for (const row of variantOptionValues) {
      const variantId = oid(
        pick(row, 'product_variant_id', 'productVariantId'),
      );
      const valueId = oid(
        pick(row, 'product_option_value_id', 'productOptionValueId', 'value_id'),
      );
      if (!variantId || !valueId) continue;
      const list = optValsByVariant.get(variantId) ?? [];
      list.push(valueId);
      optValsByVariant.set(variantId, list);
    }

    for (const p of products) {
      const mongoId = oid(p._id);
      if (!mongoId) continue;
      const name = String(pick(p, 'name') ?? 'Sản phẩm').slice(0, 255);
      const baseSlug =
        makeSlug(String(pick(p, 'slug') ?? '')) || makeSlug(name);
      // Old indexed segment on vesmart.vn
      const legacyPathSlug = `${baseSlug}-${mongoId}`.slice(0, SLUG_MAX);
      const generalInfo = pick<string>(p, 'general_info', 'generalInfo') ?? '';
      const brand = detectBrand(name);
      const brandId = await ensureBrand(brand.slug, brand.name);
      const sku = `P-${mongoId.slice(-8)}`.toUpperCase();
      const imgs = (imagesByProduct.get(mongoId) ?? []).sort(
        (a, b) => a.index - b.index,
      );
      const thumbnail = imgs[0]?.url ?? null;
      const featured = Boolean(pick(p, 'is_featured', 'isFeatured'));

      // Ensure option attributes for this product
      for (const opt of optionsByProduct.get(mongoId) ?? []) {
        const optId = oid(opt._id);
        const optName = String(pick(opt, 'name') ?? 'Option');
        const optSlug = makeSlug(String(pick(opt, 'slug') ?? optName));
        const attributeId = await ensureAttribute(optName, optSlug);
        for (const val of valuesByOption.get(optId ?? '') ?? []) {
          const valMongoId = oid(val._id);
          const value = String(pick(val, 'value') ?? '');
          const valueSlug = makeSlug(String(pick(val, 'slug') ?? value));
          if (!valMongoId || !value) continue;
          const valueId = await ensureAttributeValue(
            attributeId,
            value,
            valueSlug || makeSlug(value),
          );
          mongoOptValToPg.set(valMongoId, valueId);
        }
      }

      // Idempotent key: SKU embeds mongo id suffix; also accept prior ObjectId slug
      const existing =
        (await prisma.product.findFirst({
          where: { sku, deleted_at: null },
        })) ||
        (await prisma.product.findFirst({
          where: { slug: legacyPathSlug, deleted_at: null },
        }));

      let productId: number;
      if (existing) {
        productId = existing.id;
        const publicSlug = withIdSuffix(baseSlug, productId);
        await prisma.product.update({
          where: { id: productId },
          data: {
            name,
            slug: publicSlug,
            sku: existing.sku || sku,
            short_description: truncate(generalInfo, 500),
            description: generalInfo || null,
            thumbnail,
            featured,
            published: true,
            status: ProductStatus.PUBLISHED,
            brand_id: brandId,
            category_id: productCategory.id,
          },
        });
        bump('products_updated');
      } else {
        let finalSku = sku;
        let n = 0;
        while (await prisma.product.findUnique({ where: { sku: finalSku } })) {
          n += 1;
          finalSku = `${sku}-${n}`;
        }
        const tempSlug = `import-product-${mongoId}`.slice(0, SLUG_MAX);
        const created = await prisma.product.create({
          data: {
            name,
            slug: tempSlug,
            sku: finalSku,
            short_description: truncate(generalInfo, 500),
            description: generalInfo || null,
            thumbnail,
            featured,
            published: true,
            status: ProductStatus.PUBLISHED,
            brand: { connect: { id: brandId } },
            category: { connect: { id: productCategory.id } },
          },
        });
        productId = created.id;
        await prisma.product.update({
          where: { id: productId },
          data: { slug: withIdSuffix(baseSlug, productId) },
        });
        bump('products_created');
      }

      const publicSlug = withIdSuffix(baseSlug, productId);
      // Hard redirects: old ObjectId URLs → /products/{base}-{intId}
      pushRedirect(`/san-pham/${legacyPathSlug}`, `/products/${publicSlug}`);
      pushRedirect(`/products/${legacyPathSlug}`, `/products/${publicSlug}`);

      // Replace images
      await prisma.productImage.updateMany({
        where: { product_id: productId, deleted_at: null },
        data: { deleted_at: new Date() },
      });
      for (const [index, img] of imgs.entries()) {
        await prisma.productImage.create({
          data: {
            image_url: img.url.slice(0, 500),
            alt_text: name.slice(0, 255),
            sort_order: index,
            product: { connect: { id: productId } },
          },
        });
      }

      // Tags
      const tagIds = [...new Set(tagsByProduct.get(mongoId) ?? [])];
      if (tagIds.length) {
        await prisma.productTag.updateMany({
          where: { product_id: productId, deleted_at: null },
          data: { deleted_at: new Date() },
        });
        await prisma.productTag.createMany({
          data: tagIds.map((tag_id) => ({ product_id: productId, tag_id })),
          skipDuplicates: true,
        });
      }

      // Hard-delete old variants then recreate (SKU unique includes soft-deleted rows)
      await prisma.productVariant.deleteMany({
        where: { product_id: productId },
      });

      const productVariants = variantsByProduct.get(mongoId) ?? [];
      let vIndex = 0;
      for (const v of productVariants) {
        vIndex += 1;
        const vMongoId = oid(v._id);
        const price = Number(pick(v, 'price') ?? 0);
        const discount = Number(pick(v, 'discount_percent', 'discountPercent') ?? 0);
        const stock = Number(pick(v, 'quantity') ?? 0);
        const salePrice =
          discount > 0 && discount < 100
            ? Math.round(price * (1 - discount / 100))
            : null;
        const specific = pick<string>(v, 'specific_info', 'specificInfo');
        const vSku = `SKU-${mongoId.slice(-6)}-${vIndex}`.toUpperCase();
        const image =
          (vMongoId && variantImageByVariant.get(vMongoId)) || thumbnail;

        // Resolve attribute labels for name
        const mongoValIds = vMongoId ? optValsByVariant.get(vMongoId) ?? [] : [];
        const pgValueIds = mongoValIds
          .map((id) => mongoOptValToPg.get(id))
          .filter((x): x is number => typeof x === 'number');

        let variantName = specific?.slice(0, 255) || null;
        if (!variantName && pgValueIds.length) {
          const vals = await prisma.productAttributeValue.findMany({
            where: { id: { in: pgValueIds } },
            select: { value: true },
          });
          variantName = vals.map((x) => x.value).join(' / ').slice(0, 255) || null;
        }

        let finalVSku = vSku;
        let sn = 0;
        while (await prisma.productVariant.findUnique({ where: { sku: finalVSku } })) {
          sn += 1;
          finalVSku = `${vSku}-${sn}`;
        }

        const createdVariant = await prisma.productVariant.create({
          data: {
            sku: finalVSku,
            name: variantName,
            price,
            sale_price: salePrice,
            stock,
            image: image?.slice(0, 500) ?? null,
            status: stock > 0 ? VariantStatus.ACTIVE : VariantStatus.OUT_OF_STOCK,
            product: { connect: { id: productId } },
            ...(pgValueIds.length
              ? {
                  variant_attributes: {
                    create: pgValueIds.map((attribute_value_id) => ({
                      attribute_value: { connect: { id: attribute_value_id } },
                    })),
                  },
                }
              : {}),
          },
        });
        void createdVariant;
        bump('variants');
      }

      // Ensure at least one variant for publishable product
      if (productVariants.length === 0) {
        const fallbackSku = `SKU-${mongoId.slice(-6)}-1`.toUpperCase();
        await prisma.productVariant.create({
          data: {
            sku: fallbackSku,
            name: 'Default',
            price: 0,
            stock: 0,
            image: thumbnail,
            status: VariantStatus.INACTIVE,
            product: { connect: { id: productId } },
          },
        });
        bump('variants_fallback');
      }

      if (report.samples.products.length < 15) {
        report.samples.products.push({
          legacyPath: legacyPathSlug,
          slug: publicSlug,
          name,
          id: productId,
        });
      }
    }

    report.finishedAt = new Date().toISOString();
    bump('redirects', report.redirects.length);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(feRedirectsPath, JSON.stringify(report.redirects, null, 2));
    console.log('Migrate completed.');
    console.log(JSON.stringify(report.counts, null, 2));
    console.log(`Report → ${reportPath}`);
    console.log(`FE redirects → ${feRedirectsPath} (${report.redirects.length})`);
  } finally {
    await mongo.close().catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
}

main().catch((err) => {
  console.error(err);
  report.errors.push(String(err));
  report.finishedAt = new Date().toISOString();
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  } catch {
    /* ignore */
  }
  process.exit(1);
});
