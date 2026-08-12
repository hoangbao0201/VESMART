import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AdminSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

const AdminSection = ({
  id,
  title,
  description,
  children,
  className,
  actions,
}: AdminSectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
};

export default AdminSection;
