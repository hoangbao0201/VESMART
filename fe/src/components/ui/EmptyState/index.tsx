import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
};

const EmptyState = ({ title, description, className, action }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-dashed border-border bg-card px-6 py-10 text-center",
        className,
      )}
      role="status"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
