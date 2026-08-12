import Link from "next/link";
import { Lock, MessageSquare, Pin } from "lucide-react";
import type { ThreadListItem } from "@/types/forum";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ThreadRowProps = {
  thread: ThreadListItem;
  className?: string;
};

const ThreadRow = ({ thread, className }: ThreadRowProps) => {
  const author = thread.user?.username ?? "Ẩn danh";
  const lastActivity =
    formatRelativeTime(thread.lastReplyAt) ?? formatRelativeTime(thread.createdAt);
  const lastUser = thread.lastReplyUser?.username ?? author;

  return (
    <Link
      href={`/forum/threads/${thread.slug}`}
      className={cn(
        "forum-thread-row group grid grid-cols-[auto_1fr_auto] items-center gap-2 border border-[#d5dbe3] bg-card px-2 py-2 transition-colors hover:bg-[#f5f7fa] dark:border-[#2f3640] dark:hover:bg-[#1a1f27] sm:gap-4 sm:px-4 sm:py-2.5",
        className,
      )}
    >
      <UserAvatar username={author} avatar={thread.user?.avatar} />

      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {thread.isPinned ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary">
              <Pin className="size-3" aria-hidden />
              Ghim
            </span>
          ) : null}
          {thread.isLocked ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground">
              <Lock className="size-3" aria-hidden />
              Khóa
            </span>
          ) : null}
          {thread.forum ? (
            <span className="text-[11px] text-muted-foreground">{thread.forum.name}</span>
          ) : null}
        </div>
        <h3 className="truncate text-sm font-semibold text-[#1565c0] group-hover:underline dark:text-[#64b5f6]">
          {thread.title}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {author}
          {lastActivity ? ` · ${lastActivity}` : null}
          {lastUser && lastUser !== author ? ` · ${lastUser}` : null}
        </p>
      </div>

      <dl className="hidden min-w-[4.5rem] text-right text-xs text-muted-foreground sm:block">
        <div className="flex items-center justify-end gap-1">
          <MessageSquare className="size-3.5 shrink-0 opacity-60" aria-hidden />
          <dd>
            <span className="font-semibold text-foreground">{thread.replyCount}</span>
          </dd>
        </div>
        <div className="mt-0.5">
          <dt className="sr-only">Lượt xem</dt>
          <dd>{thread.views} xem</dd>
        </div>
      </dl>
    </Link>
  );
};

export default ThreadRow;
