"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/forums", label: "Tổng quan", exact: true },
  { href: "/admin/forums/auto", label: "Forum Auto" },
  { href: "/admin/forums/categories", label: "Categories" },
  { href: "/admin/forums/boards", label: "Forums" },
  { href: "/admin/forums/threads", label: "Threads" },
  { href: "/admin/forums/posts", label: "Posts" },
] as const;

const ForumAdminNav = () => {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default ForumAdminNav;
