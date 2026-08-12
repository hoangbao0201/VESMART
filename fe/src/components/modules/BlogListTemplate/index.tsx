import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import BlogCard from "@/components/ui/BlogCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import JsonLd from "@/components/seo/JsonLd";
import { listPostCategories, listPostsPage } from "@/lib/api/posts";
import { breadcrumbJsonLd, itemListJsonLd, postPath } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

export type BlogListFilters = {
  page?: number;
  category?: string;
  tag?: string;
};

type BlogListTemplateProps = {
  filters?: BlogListFilters;
};

function buildBlogHref(params: { category?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

const BlogListTemplate = async ({ filters = {} }: BlogListTemplateProps) => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = 12;

  const [categories, catalog] = await Promise.all([
    listPostCategories(),
    listPostsPage({
      page,
      limit,
      categorySlug: filters.category,
      sort: "published_at:desc",
    }),
  ]);

  const totalPages = Math.max(catalog.meta.totalPages, catalog.items.length > 0 ? 1 : 0);
  const listJson = itemListJsonLd(
    "Bài viết VESMART",
    catalog.items.slice(0, 24).map((item) => ({
      name: item.title,
      path: postPath(item.slug),
    })),
  );

  return (
    <Container className="py-8 sm:py-10">
      <JsonLd
        data={[
          listJson,
          breadcrumbJsonLd([
            { name: "Trang chủ", path: "/" },
            { name: "Bài viết", path: "/blog" },
          ]),
        ]}
      />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Bài viết" },
        ]}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bài viết</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Review, hướng dẫn và tin tức robot hút bụi từ cộng đồng VESMART.
          </p>
        </div>
        <Link
          href="/blog/new"
          className="inline-flex h-11 items-center justify-center rounded-[12px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:opacity-90"
        >
          Viết bài mới
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2" aria-label="Danh mục bài viết">
          <h2 className="text-sm font-semibold">Danh mục</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href={buildBlogHref({})}
                className={cn(
                  "block rounded-[12px] px-3 py-2 text-sm transition-colors duration-150",
                  !filters.category
                    ? "bg-secondary font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                Tất cả
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={buildBlogHref({ category: category.slug })}
                  className={cn(
                    "block rounded-[12px] px-3 py-2 text-sm transition-colors duration-150",
                    filters.category === category.slug
                      ? "bg-secondary font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
          {categories.length === 0 ? (
            <p className="px-3 text-xs text-muted-foreground">Chưa có danh mục từ API.</p>
          ) : null}
        </aside>

        <div className="min-w-0 space-y-6">
          {catalog.items.length === 0 ? (
            <EmptyState
              title="Chưa có bài viết"
              description="Thử đổi danh mục, hoặc đợi CMS bài viết sẵn sàng."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.items.map((post) => (
                <li key={post.id}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={catalog.meta.page || page}
            totalPages={totalPages}
            buildHref={(nextPage) =>
              buildBlogHref({ category: filters.category, page: nextPage })
            }
          />
        </div>
      </div>
    </Container>
  );
};

export default BlogListTemplate;
