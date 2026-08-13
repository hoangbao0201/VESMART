import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, Pin } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import MarkdownContent from "@/components/ui/MarkdownContent";
import ReactionsBar from "@/components/ui/ReactionsBar";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import "./forum-post.css";

type ForumPostTag = {
  id: number | string;
  name: string;
};

type ForumPostBlockProps = {
  postNumber: number;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  /** Show reaction bar (replies only). */
  showReactions?: boolean;
  reactionTargetId?: string | number;
  /** First post / OP highlight. */
  isOriginal?: boolean;
  /** Thread title — only for OP card (merged header). */
  title?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  replyCount?: number;
  views?: number;
  tags?: ForumPostTag[];
  /** e.g. FavoriteButton */
  actions?: ReactNode;
};

const ForumPostBlock = ({
  postNumber,
  content,
  createdAt,
  editedAt,
  username,
  displayName,
  avatar,
  showReactions = false,
  reactionTargetId,
  isOriginal = false,
  title,
  isPinned = false,
  isLocked = false,
  replyCount,
  views,
  tags = [],
  actions,
}: ForumPostBlockProps) => {
  const name = (displayName?.trim() || username).trim() || "Thành viên";
  const displayTime =
    formatRelativeTime(createdAt) ?? formatDate(createdAt) ?? createdAt;
  const showThreadMeta =
    Boolean(title) ||
    isPinned ||
    isLocked ||
    replyCount != null ||
    views != null ||
    tags.length > 0;

  return (
    <article
      className={`forum-post${isOriginal ? " forum-post--op" : ""}`}
      aria-label={title ? `${title} — bài của ${name}` : `Bài của ${name}`}
    >
      <Link href={`/u/${username}`} className="forum-post-avatar" title={name}>
        <UserAvatar username={name} avatar={avatar} size="md" colorKey={username} />
      </Link>

      <div className="forum-post-main">
        <header className="forum-post-head">
          <div className="forum-post-who">
            <Link href={`/u/${username}`} className="forum-post-username">
              {name}
            </Link>
            {isOriginal ? <span className="forum-post-badge">Chủ thread</span> : null}
            <span className="forum-post-meta" aria-hidden>
              ·
            </span>
            <time
              className="forum-post-time"
              dateTime={createdAt}
              title={formatDate(createdAt) ?? createdAt}
            >
              {displayTime}
            </time>
            {editedAt ? <span className="forum-post-meta">· đã sửa</span> : null}
          </div>
          <span className="forum-post-num">#{postNumber}</span>
        </header>

        {showThreadMeta ? (
          <div className="forum-post-thread">
            {isPinned || isLocked ? (
              <div className="forum-post-flags">
                {isPinned ? (
                  <span className="forum-post-flag forum-post-flag--pin">
                    <Pin className="size-3.5" aria-hidden />
                    Ghim
                  </span>
                ) : null}
                {isLocked ? (
                  <span className="forum-post-flag forum-post-flag--lock">
                    <Lock className="size-3.5" aria-hidden />
                    Khóa
                  </span>
                ) : null}
              </div>
            ) : null}

            {title ? <h1 className="forum-post-title">{title}</h1> : null}

            {replyCount != null || views != null ? (
              <p className="forum-post-stats">
                {replyCount != null ? <span>{replyCount} trả lời</span> : null}
                {replyCount != null && views != null ? (
                  <span aria-hidden>·</span>
                ) : null}
                {views != null ? <span>{views} lượt xem</span> : null}
              </p>
            ) : null}

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
        ) : null}

        <div className="forum-post-body">
          <MarkdownContent
            content={content}
            mode="lite"
            showToc={false}
            asArticle={false}
          />
        </div>

        {actions || (showReactions && reactionTargetId != null) ? (
          <footer className="forum-post-foot">
            {actions}
            {showReactions && reactionTargetId != null ? (
              <ReactionsBar
                targetType="FORUM_POST"
                targetId={reactionTargetId}
                variant="compact"
              />
            ) : null}
          </footer>
        ) : null}
      </div>
    </article>
  );
};

export default ForumPostBlock;
