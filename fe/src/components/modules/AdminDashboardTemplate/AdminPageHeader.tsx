import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

const AdminPageHeader = ({ title, description, actions }: AdminPageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <Link
          href="/admin"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Admin
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
};

export default AdminPageHeader;
