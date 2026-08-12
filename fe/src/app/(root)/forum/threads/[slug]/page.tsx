import type { Metadata } from "next";
import ThreadDetailTemplate from "@/components/modules/ThreadDetailTemplate";
import { getThreadBySlug } from "@/lib/api/forums";
import { threadPath, toPlainText } from "@/lib/seo";

type ThreadDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ThreadDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const thread = await getThreadBySlug(slug);

  if (!thread) {
    return {
      title: "Không tìm thấy chủ đề",
      robots: { index: false, follow: false },
    };
  }

  const title = thread.seoTitle?.trim() || thread.title;
  const description =
    thread.seoDescription?.trim() ||
    toPlainText(thread.content, 160) ||
    `Thảo luận ${thread.title} trên diễn đàn VESMART.`;

  return {
    title,
    description,
    alternates: { canonical: threadPath(thread.slug) },
    openGraph: {
      title,
      description,
      type: "article",
      url: threadPath(thread.slug),
      publishedTime: thread.createdAt,
    },
  };
}

const ThreadDetailPage = async ({ params }: ThreadDetailPageProps) => {
  const { slug } = await params;
  return <ThreadDetailTemplate slug={slug} />;
};

export default ThreadDetailPage;
