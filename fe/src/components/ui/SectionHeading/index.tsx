import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  id?: string;
};

const SectionHeading = ({
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
  className,
  id,
}: SectionHeadingProps) => {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
};

export default SectionHeading;
