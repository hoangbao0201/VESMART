import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import JsonLd from "@/components/seo/JsonLd";
import { listForumCategories } from "@/lib/api/forums";
import { breadcrumbJsonLd, forumPath, itemListJsonLd } from "@/lib/seo";

const ForumHomeTemplate = async () => {
  const categories = await listForumCategories();
  const hasForums = categories.some((c) => (c.forums?.length ?? 0) > 0);
  const forumItems = categories.flatMap((c) =>
    (c.forums ?? []).map((f) => ({ name: f.name, path: forumPath(f.slug) })),
  );

  return (
    <Container className="py-8 sm:py-10 px-2 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          itemListJsonLd("Diễn đàn VESMART", forumItems.slice(0, 24)),
          breadcrumbJsonLd([
            { name: "Trang chủ", path: "/" },
            { name: "Diễn đàn", path: "/forum" },
          ]),
        ]}
      />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Diễn đàn" },
        ]}
      />

      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Diễn đàn</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Chuyên mục theo nhóm - thảo luận sản phẩm, hỗ trợ và kinh nghiệm sử dụng.
        </p>
      </div>

      {!hasForums ? (
        <EmptyState
          title="Chưa có chuyên mục"
          description="Forum categories sẽ hiển thị khi API /forum-categories sẵn sàng."
        />
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const forums = category.forums ?? [];
            if (forums.length === 0) return null;

            return (
              <section key={category.id} className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{category.name}</h2>
                  {category.description ? (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  ) : null}
                </div>

                <ul className="overflow-hidden rounded-[12px] border border-border bg-card shadow-sm">
                  {forums.map((forum, index) => (
                    <li
                      key={forum.id}
                      className={index > 0 ? "border-t border-border" : undefined}
                    >
                      <Link
                        href={`/forum/${forum.slug}`}
                        className="grid gap-3 px-4 py-4 transition-colors duration-150 hover:bg-secondary/50 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-secondary text-secondary-foreground">
                            <MessagesSquare className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 space-y-1">
                            <h3 className="truncate text-sm font-semibold sm:text-base">
                              {forum.name}
                            </h3>
                            {forum.description ? (
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {forum.description}
                              </p>
                            ) : null}
                            {forum.lastThread ? (
                              <p className="truncate text-xs text-muted-foreground">
                                Mới nhất: {forum.lastThread.title}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <dl className="flex gap-6 text-xs text-muted-foreground sm:justify-end sm:text-sm">
                          <div>
                            <dt className="sr-only">Chủ đề</dt>
                            <dd>
                              <span className="font-semibold text-foreground">
                                {forum.threadCount}
                              </span>{" "}
                              chủ đề
                            </dd>
                          </div>
                          <div>
                            <dt className="sr-only">Bài viết</dt>
                            <dd>
                              <span className="font-semibold text-foreground">
                                {forum.postCount}
                              </span>{" "}
                              bài
                            </dd>
                          </div>
                        </dl>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default ForumHomeTemplate;
