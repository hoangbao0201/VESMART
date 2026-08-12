import type { Metadata } from "next";
import BlogDetailTemplate from "@/components/modules/BlogDetailTemplate";
import { getPostBySlug } from "@/lib/api/posts";
import { postPath, toPlainText } from "@/lib/seo";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
      robots: { index: false, follow: false },
    };
  }

  const title = post.seoTitle?.trim() || post.title;
  const description =
    post.seoDescription?.trim() ||
    post.summary?.trim() ||
    toPlainText(post.content, 160) ||
    `Đọc bài viết ${post.title} trên VESMART.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: postPath(post.slug),
      publishedTime: post.publishedAt ?? undefined,
      images: post.thumbnail ? [{ url: post.thumbnail, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.thumbnail ? [post.thumbnail] : undefined,
    },
    alternates: {
      canonical: postPath(post.slug),
    },
  };
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
  const { slug } = await params;
  return <BlogDetailTemplate slug={slug} />;
};

export default BlogDetailPage;
