import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import MarkdownContent from "@/components/ui/MarkdownContent";
import ReactionsBar from "@/components/ui/ReactionsBar";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import "./forum-post.css";

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
}: ForumPostBlockProps) => {
  const name = (displayName?.trim() || username).trim() || "Thành viên";
  const displayTime =
    formatRelativeTime(createdAt) ?? formatDate(createdAt) ?? createdAt;

  return (
    <article
      className={`forum-post${isOriginal ? " forum-post--op" : ""}`}
      aria-label={`Bài của ${name}`}
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
            <time className="forum-post-time" dateTime={createdAt} title={formatDate(createdAt) ?? createdAt}>
              {displayTime}
            </time>
            {editedAt ? <span className="forum-post-meta">· đã sửa</span> : null}
          </div>
          <span className="forum-post-num">#{postNumber}</span>
        </header>

        <div className="forum-post-body">
          <MarkdownContent
            content={content}
            mode="lite"
            showToc={false}
            asArticle={false}
          />
        </div>

        {showReactions && reactionTargetId != null ? (
          <footer className="forum-post-foot">
            <ReactionsBar
              targetType="FORUM_POST"
              targetId={reactionTargetId}
              variant="compact"
            />
          </footer>
        ) : null}
      </div>
    </article>
  );
};

export default ForumPostBlock;
