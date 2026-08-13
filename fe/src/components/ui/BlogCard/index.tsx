import Image from "next/image";
import Link from "next/link";
import type { PostListItem } from "@/types/post";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toCdnDisplayUrl } from "@/lib/media/cdn-image";

type BlogCardProps = {
  post: PostListItem;
  className?: string;
};

const BlogCard = ({ post, className }: BlogCardProps) => {
  const published = formatDate(post.publishedAt);
  const thumb = post.thumbnail ? toCdnDisplayUrl(post.thumbnail) : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group translate-y-0 hover:translate-y-[-2px] flex h-full flex-col overflow-hidden border border-border bg-card shadow-sm transition duration-150 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {thumb ? (
          <Image
            src={thumb}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {post.category ? <span>{post.category.name}</span> : null}
          {published ? (
            <>
              {post.category ? <span aria-hidden>·</span> : null}
              <time dateTime={post.publishedAt ?? undefined}>{published}</time>
            </>
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-card-foreground">
          {post.title}
        </h3>
        {post.summary ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.summary}</p>
        ) : null}
      </div>
    </Link>
  );
};

export default BlogCard;
