import { listForumCategories, listThreadsPage } from "@/lib/api/forums";
import { listPostsPage } from "@/lib/api/posts";
import { listProductsPage } from "@/lib/api/products";
import { listTags } from "@/lib/api/tags";
import {
  forumPath,
  postPath,
  productPath,
  tagPath,
  threadPath,
} from "@/lib/seo";
import type { SitemapUrlEntry } from "@/lib/sitemap/build-sitemap-xml";

const PAGE_SIZE = 100;

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function getMainSitemapEntries(): SitemapUrlEntry[] {
  const now = new Date();
  return [
    { path: "/", lastmod: now, changefreq: "daily", priority: 1 },
    { path: "/products", lastmod: now, changefreq: "daily", priority: 0.9 },
    { path: "/blog", lastmod: now, changefreq: "daily", priority: 0.9 },
    { path: "/images", lastmod: now, changefreq: "daily", priority: 0.7 },
    { path: "/forum", lastmod: now, changefreq: "daily", priority: 0.85 },
  ];
}

export async function getProductSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const entries: SitemapUrlEntry[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await listProductsPage({ page, limit: PAGE_SIZE });
    totalPages = Math.max(1, data.meta.totalPages || 1);
    for (const product of data.items) {
      entries.push({
        path: productPath(product.slug),
        lastmod: parseDate(product.updatedAt) ?? parseDate(product.createdAt),
        changefreq: "weekly",
        priority: 0.8,
      });
    }
    page += 1;
    if (data.items.length === 0) break;
  }

  return entries;
}

export async function getPostSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const entries: SitemapUrlEntry[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await listPostsPage({ page, limit: PAGE_SIZE });
    totalPages = Math.max(1, data.meta.totalPages || 1);
    for (const post of data.items) {
      entries.push({
        path: postPath(post.slug),
        lastmod: parseDate(post.publishedAt),
        changefreq: "weekly",
        priority: 0.75,
      });
    }
    page += 1;
    if (data.items.length === 0) break;
  }

  return entries;
}

export async function getTagSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const tags = await listTags({ limit: 200 });
  return tags.map((tag) => ({
    path: tagPath(tag.slug),
    changefreq: "weekly" as const,
    priority: 0.65,
  }));
}

export async function getForumSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const entries: SitemapUrlEntry[] = [];
  const categories = await listForumCategories();

  for (const category of categories) {
    for (const forum of category.forums ?? []) {
      entries.push({
        path: forumPath(forum.slug),
        changefreq: "weekly",
        priority: 0.6,
      });
    }
  }

  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const data = await listThreadsPage({ page, limit: PAGE_SIZE });
    totalPages = Math.max(1, data.meta.totalPages || 1);
    for (const thread of data.items) {
      entries.push({
        path: threadPath(thread.slug),
        lastmod: parseDate(thread.lastReplyAt) ?? parseDate(thread.createdAt),
        changefreq: "weekly",
        priority: 0.55,
      });
    }
    page += 1;
    if (data.items.length === 0) break;
  }

  return entries;
}
