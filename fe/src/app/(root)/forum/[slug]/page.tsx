import type { Metadata } from "next";
import ForumThreadListTemplate from "@/components/modules/ForumThreadListTemplate";
import { getForumBySlug } from "@/lib/api/forums";
import { forumPath, toPlainText } from "@/lib/seo";

type ForumThreadListPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: ForumThreadListPageProps): Promise<Metadata> {
  const { slug } = await params;
  const forum = await getForumBySlug(slug);

  if (!forum) {
    return {
      title: "Không tìm thấy chuyên mục",
      robots: { index: false, follow: false },
    };
  }

  const title = forum.seoTitle?.trim() || forum.name;
  const description =
    forum.seoDescription?.trim() ||
    toPlainText(forum.description, 160) ||
    `Chủ đề trong chuyên mục ${forum.name} trên diễn đàn VESMART.`;

  return {
    title,
    description,
    alternates: { canonical: forumPath(forum.slug) },
    openGraph: {
      title,
      description,
      url: forumPath(forum.slug),
    },
  };
}

const ForumThreadListPage = async ({
  params,
  searchParams,
}: ForumThreadListPageProps) => {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1;

  return (
    <ForumThreadListTemplate
      slug={slug}
      page={Number.isFinite(page) ? page : 1}
    />
  );
};

export default ForumThreadListPage;
