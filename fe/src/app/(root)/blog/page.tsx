import type { Metadata } from "next";
import BlogListTemplate from "@/components/modules/BlogListTemplate";
import { tagPath } from "@/lib/seo";

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;
  const pageNum = Number.isFinite(page) ? page : 1;
  const tag = params.tag?.trim();
  const category = params.category?.trim();

  const canonical = tag
    ? tagPath(tag)
    : category
      ? `/blog?category=${encodeURIComponent(category)}`
      : "/blog";

  const noindex = pageNum > 1;

  return {
    title: tag ? `Tag: ${tag}` : category ? `Danh mục: ${category}` : "Bài viết",
    description:
      "Review, hướng dẫn sửa chữa và tin tức robot hút bụi từ VESMART.",
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: tag ? `${tag} · Bài viết VESMART` : "Bài viết · VESMART",
      description: "Review và hướng dẫn robot hút bụi.",
      url: canonical,
    },
  };
}

const BlogPage = async ({ searchParams }: BlogPageProps) => {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  return (
    <BlogListTemplate
      filters={{
        page: Number.isFinite(page) ? page : 1,
        category: params.category,
        tag: params.tag,
      }}
    />
  );
};

export default BlogPage;
