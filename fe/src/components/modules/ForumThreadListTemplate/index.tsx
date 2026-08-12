import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ThreadRow from "@/components/ui/ThreadRow";
import JsonLd from "@/components/seo/JsonLd";
import { getForumBySlug, listThreadsPage } from "@/lib/api/forums";
import { breadcrumbJsonLd, forumPath } from "@/lib/seo";

type ForumThreadListTemplateProps = {
  slug: string;
  page?: number;
};

const ForumThreadListTemplate = async ({
  slug,
  page: pageProp = 1,
}: ForumThreadListTemplateProps) => {
  const page = pageProp > 0 ? pageProp : 1;
  const limit = 20;
  const forum = await getForumBySlug(slug);

  const threads = await listThreadsPage({
    page,
    limit,
    forumSlug: slug,
    forumId: forum?.id,
    sort: "last_reply_at:desc",
  });

  const totalPages = Math.max(threads.meta.totalPages, threads.items.length > 0 ? 1 : 0);
  const title = forum?.name ?? slug;
  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Diễn đàn", path: "/forum" },
    { name: title, path: forumPath(slug) },
  ];

  return (
    <Container className="py-8 sm:py-10 px-2 sm:px-6 lg:px-8">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Diễn đàn", href: "/forum" },
          ...(forum?.category
            ? [{ label: forum.category.name, href: "/forum" }]
            : []),
          { label: title },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {forum?.description ? (
            <p className="text-sm text-muted-foreground sm:text-base">{forum.description}</p>
          ) : null}
          {forum ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {forum.threadCount} chủ đề · {forum.postCount} bài viết
            </p>
          ) : null}
        </div>
      </div>

      {!forum && threads.items.length === 0 ? (
        <EmptyState
          title="Không tìm thấy chuyên mục"
          description="Kiểm tra slug hoặc đợi API forums sẵn sàng."
        />
      ) : threads.items.length === 0 ? (
        <EmptyState
          title="Chưa có chủ đề"
          description="Hãy là người mở chủ đề đầu tiên trong chuyên mục này."
        />
      ) : (
        <ul className="divide-y divide-[#d5dbe3] border border-[#d5dbe3] bg-card dark:divide-[#2f3640] dark:border-[#2f3640]">
          {threads.items.map((thread) => (
            <li key={thread.id}>
              <ThreadRow thread={thread} className="border-0" />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={threads.meta.page || page}
        totalPages={totalPages}
        buildHref={(nextPage) =>
          nextPage > 1 ? `/forum/${slug}?page=${nextPage}` : `/forum/${slug}`
        }
      />

      {!forum && threads.items.length > 0 ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Đang hiển thị theo slug.{" "}
          <Link href="/forum" className="text-primary hover:underline">
            Về diễn đàn
          </Link>
        </p>
      ) : null}
    </Container>
  );
};

export default ForumThreadListTemplate;
