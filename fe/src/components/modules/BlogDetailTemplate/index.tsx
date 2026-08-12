import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import FavoriteButton from "@/components/ui/FavoriteButton";
import DeferredCommentsSection from "@/components/ui/CommentsSection/DeferredCommentsSection";
import UserAvatar from "@/components/ui/UserAvatar";
import MarkdownContent from "@/components/ui/MarkdownContent";
import MarkdownToc from "@/components/ui/MarkdownContent/MarkdownToc";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/configs/site.config";
import { getPostBySlug, listRelatedPosts } from "@/lib/api/posts";
import {
  extractMarkdownHeadings,
  looksLikeHtml,
} from "@/lib/markdown";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  postPath,
  toPlainText,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils/format";
import EditPostLink from "./components/EditPostLink";
import RelatedPostsSection from "./components/RelatedPostsSection";

type BlogDetailTemplateProps = {
  slug: string;
};

const BlogDetailTemplate = async ({ slug }: BlogDetailTemplateProps) => {
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <Container className="py-8 sm:py-10">
        <EmptyState
          title="Không tìm thấy bài viết"
          description="Bài viết có thể chưa publish hoặc API chưa sẵn sàng."
        />
        <p className="mt-4 text-center text-sm">
          <Link href="/blog" className="font-medium text-primary hover:underline">
            Về danh sách bài viết
          </Link>
        </p>
      </Container>
    );
  }

  const relatedPosts = await listRelatedPosts({
    postId: post.id,
    categorySlug: post.category?.slug,
    limit: 8,
  });

  const published = formatDate(post.publishedAt);
  const author = post.author?.username ?? "Biên tập viên";
  const tags = post.tags ?? [];
  const headings =
    !looksLikeHtml(post.content) ? extractMarkdownHeadings(post.content) : [];
  const showToc = headings.length >= 2;

  const crumbItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Bài viết", path: "/blog" },
    ...(post.category
      ? [{ name: post.category.name, path: `/blog?category=${post.category.slug}` }]
      : []),
    { name: post.title, path: postPath(post.slug) },
  ];
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.seoDescription ||
      post.summary ||
      toPlainText(post.content, 200) ||
      post.title,
    image: post.thumbnail ? absoluteUrl(post.thumbnail) : undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    author: {
      "@type": "Person",
      name: author,
      url: absoluteUrl(`/u/${post.author?.username ?? author}`),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_CONFIG.logo),
      },
    },
    mainEntityOfPage: absoluteUrl(postPath(post.slug)),
  };

  return (
    <div className="bg-secondary/40 pb-12 pt-4 sm:pb-16 sm:pt-6 overflow-x-clip">
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd(crumbItems)]} />
      {/* Mobile: no container gutter - avoid double px with article padding */}
      <Container className="max-w-[1280px] px-0 sm:px-6 lg:px-8 min-w-0">
        <Breadcrumb
          className="mb-4 px-3 sm:px-0"
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Bài viết", href: "/blog" },
            ...(post.category
              ? [{ label: post.category.name, href: `/blog?category=${post.category.slug}` }]
              : []),
            { label: post.title },
          ]}
        />

        {/* Dev.to-like: wide article card (~880–920px) + sticky TOC */}
        <div className={showToc ? "vesmart-article-shell has-toc" : "vesmart-article-shell"}>
          <article className="vesmart-article-card min-w-0 overflow-hidden border-y border-border bg-card shadow-sm sm:rounded-[12px] sm:border">
            {post.thumbnail ? (
              <div className="relative aspect-[1000/420] w-full bg-secondary sm:aspect-[2.4/1]">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 920px"
                />
              </div>
            ) : null}

            <header className="space-y-5 px-3 pb-2 pt-6 sm:px-8 sm:pt-8 lg:px-12">
              {tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                        className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        #{tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <h1 className="min-w-0 flex-1 text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl sm:leading-[1.15]">
                  {post.title}
                </h1>
                <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">
                  <EditPostLink postId={post.id} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/u/${post.author?.username ?? author}`}
                  className="inline-flex items-center gap-3 rounded-full py-1 pr-3 transition-colors hover:bg-secondary"
                >
                  <UserAvatar username={author} avatar={post.author?.avatar} size="md" />
                  <span className="text-sm font-semibold text-foreground">{author}</span>
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {published ? (
                    <time dateTime={post.publishedAt ?? undefined}>{published}</time>
                  ) : null}
                  <span aria-hidden>·</span>
                  <span>{post.views} lượt xem</span>
                  {post.category ? (
                    <>
                      <span aria-hidden>·</span>
                      <Link
                        href={`/blog?category=${post.category.slug}`}
                        className="font-medium text-foreground/80 hover:text-primary"
                      >
                        {post.category.name}
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>

              {post.summary ? (
                <p className="border-l-4 border-primary/40 pl-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {post.summary}
                </p>
              ) : null}
            </header>

            <div className="vesmart-article-body min-w-0 px-3 pb-8 pt-4 sm:px-8 sm:pb-10 lg:px-12">
              <MarkdownContent
                content={post.content}
                showToc={false}
                asArticle={false}
                className="vesmart-md-article"
              />

              <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Bài viết này có hữu ích?</p>
                  <p className="text-sm text-muted-foreground">
                    Lưu yêu thích để đọc lại sau hoặc chia sẻ với người thân.
                  </p>
                </div>
                <FavoriteButton targetType="POST" targetId={post.id} className="shrink-0" />
              </div>
            </div>

            <div className="border-t border-border px-3 py-8 sm:px-8 lg:px-12">
              <DeferredCommentsSection targetType="POST" targetId={post.id} />
            </div>
          </article>

          {showToc ? (
            <div className="vesmart-article-toc px-3 sm:px-0">
              <MarkdownToc headings={headings} />
            </div>
          ) : null}
        </div>

        <div className="px-3 sm:px-0">
          <RelatedPostsSection
            posts={relatedPosts}
            categorySlug={post.category?.slug}
          />
        </div>
      </Container>
    </div>
  );
};

export default BlogDetailTemplate;
