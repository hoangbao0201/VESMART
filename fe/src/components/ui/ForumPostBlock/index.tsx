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
  avatar?: string | null;
  /** Show reaction bar (replies only). */
  showReactions?: boolean;
  reactionTargetId?: string | number;
};

const ForumPostBlock = ({
  postNumber,
  content,
  createdAt,
  editedAt,
  username,
  avatar,
  showReactions = false,
  reactionTargetId,
}: ForumPostBlockProps) => {
  const displayTime =
    formatRelativeTime(createdAt) ?? formatDate(createdAt) ?? createdAt;

  return (
    <article className="forum-post">
      <aside className="forum-post-user">
        <Link href={`/u/${username}`} title={username}>
          <UserAvatar username={username} avatar={avatar} size="lg" />
        </Link>
        <Link href={`/u/${username}`} className="forum-post-username">
          {username}
        </Link>
        <span className="forum-post-rank">Thành viên</span>
      </aside>

      <div className="forum-post-main">
        <header className="forum-post-head">
          <div className="flex flex-wrap items-center gap-x-2">
            <time dateTime={createdAt}>{displayTime}</time>
            {editedAt ? <span>· đã sửa</span> : null}
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
