import Link from "next/link";
import { Lock, Pin } from "lucide-react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ForumPostBlock from "@/components/ui/ForumPostBlock";
import ReplyBox from "@/components/ui/ReplyBox";
import JsonLd from "@/components/seo/JsonLd";
import { getThreadBySlug, listThreadPosts } from "@/lib/api/forums";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  forumPath,
  threadPath,
  toPlainText,
} from "@/lib/seo";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import "@/components/ui/ForumPostBlock/forum-post.css";

type ThreadDetailTemplateProps = {
  slug: string;
};

const ThreadDetailTemplate = async ({ slug }: ThreadDetailTemplateProps) => {
  const thread = await getThreadBySlug(slug);

  if (!thread) {
    return (
      <Container className="py-8 sm:py-10 px-2 sm:px-6 lg:px-8">
        <div className="forum-thread max-w-4xl">
          <div className="forum-thread-title">
            <p className="text-sm text-muted-foreground">Không tìm thấy chủ đề.</p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/forum" className="font-medium text-primary hover:underline">
            Về diễn đàn
          </Link>
        </p>
      </Container>
    );
  }

  const nestedPosts = thread.posts ?? [];
  const postsPage =
    nestedPosts.length > 0
      ? { items: nestedPosts }
      : await listThreadPosts(thread.id, { page: 1, limit: 50 });
  const posts = postsPage.items;
  const author = thread.user?.username ?? "Ẩn danh";
  const tags = thread.tags ?? [];
  const discussionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: thread.title,
    text: toPlainText(thread.content, 300),
    datePublished: thread.createdAt,
    author: { "@type": "Person", name: author },
    url: absoluteUrl(threadPath(thread.slug)),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: thread.replyCount,
    },
  };
  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Diễn đàn", path: "/forum" },
    ...(thread.forum
      ? [{ name: thread.forum.name, path: forumPath(thread.forum.slug) }]
      : []),
    { name: thread.title, path: threadPath(thread.slug) },
  ];

  return (
    <Container className="py-6 sm:py-8 px-2 sm:px-6 lg:px-8">
      <JsonLd data={[discussionJsonLd, breadcrumbJsonLd(crumbs)]} />
      <Breadcrumb
        className="mb-4 sm:mb-6"
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Diễn đàn", href: "/forum" },
          ...(thread.forum
            ? [{ label: thread.forum.name, href: `/forum/${thread.forum.slug}` }]
            : []),
          { label: thread.title },
        ]}
      />

      <div className="forum-thread mx-auto max-w-4xl">
        <header className="forum-thread-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {thread.isPinned ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <Pin className="size-3.5" aria-hidden />
                    Ghim
                  </span>
                ) : null}
                {thread.isLocked ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden />
                    Khóa
                  </span>
                ) : null}
              </div>
              <h1>{thread.title}</h1>
              <div className="forum-thread-meta">
                <span>
                  bởi{" "}
                  <Link
                    href={`/u/${author}`}
                    className="font-semibold text-[#1565c0] hover:underline dark:text-[#64b5f6]"
                  >
                    {author}
                  </Link>
                </span>
                <span aria-hidden>·</span>
                <time dateTime={thread.createdAt}>
                  {formatDate(thread.createdAt) ??
                    formatRelativeTime(thread.createdAt)}
                </time>
                <span aria-hidden>·</span>
                <span>{thread.replyCount} trả lời</span>
                <span aria-hidden>·</span>
                <span>{thread.views} lượt xem</span>
              </div>
              {tags.length > 0 ? (
                <ul className="forum-thread-tags">
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <span className="forum-thread-tag">{tag.name}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <FavoriteButton targetType="THREAD" targetId={thread.id} />
          </div>
        </header>

        <div className="forum-post-list">
          <ForumPostBlock
            postNumber={1}
            content={thread.content}
            createdAt={thread.createdAt}
            username={author}
            avatar={thread.user?.avatar}
          />

          {posts.length === 0 ? (
            <p className="forum-empty-replies">Chưa có trả lời. Hãy là người đầu tiên.</p>
          ) : (
            posts.map((post, index) => {
              const postAuthor = post.user?.username ?? "Thành viên";
              return (
                <ForumPostBlock
                  key={post.id}
                  postNumber={index + 2}
                  content={post.content}
                  createdAt={post.createdAt}
                  editedAt={post.editedAt}
                  username={postAuthor}
                  avatar={post.user?.avatar}
                  showReactions
                  reactionTargetId={post.id}
                />
              );
            })
          )}
        </div>

        <section className="forum-quick-reply" aria-labelledby="quick-reply-heading">
          <h2 id="quick-reply-heading" className="forum-quick-reply-title">
            Trả lời nhanh
          </h2>
          <ReplyBox threadId={thread.id} locked={thread.isLocked} variant="forum" />
        </section>
      </div>
    </Container>
  );
};

export default ThreadDetailTemplate;
