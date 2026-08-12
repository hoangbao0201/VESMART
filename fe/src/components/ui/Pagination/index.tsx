import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

const Pagination = ({ page, totalPages, buildHref, className }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Phân trang"
      className={cn("mt-8 flex items-center justify-center gap-2", className)}
    >
      {prev ? (
        <Link
          href={buildHref(prev)}
          className="inline-flex h-10 items-center gap-1 rounded-[12px] border border-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Trước
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center gap-1 rounded-[12px] border border-border px-3 text-sm text-muted-foreground opacity-50">
          <ChevronLeft className="size-4" aria-hidden />
          Trước
        </span>
      )}

      <span className="min-w-24 text-center text-sm text-muted-foreground">
        Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages}
      </span>

      {next ? (
        <Link
          href={buildHref(next)}
          className="inline-flex h-10 items-center gap-1 rounded-[12px] border border-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-secondary"
        >
          Sau
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center gap-1 rounded-[12px] border border-border px-3 text-sm text-muted-foreground opacity-50">
          Sau
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
};

export default Pagination;
