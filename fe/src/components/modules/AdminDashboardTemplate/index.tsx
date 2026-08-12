"use client";

import Link from "next/link";
import {
  FolderTree,
  Images,
  MessageSquareWarning,
  Newspaper,
  Package,
  Tags,
  Users,
} from "lucide-react";
import Container from "@/components/ui/Container";
import AdminGate from "./AdminGate";

const SECTIONS = [
  {
    title: "Catalog",
    description: "Thương hiệu, danh mục và sản phẩm.",
    links: [
      { href: "/admin/brands", label: "Thương hiệu", icon: Tags },
      { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
      { href: "/admin/products", label: "Sản phẩm / biến thể", icon: Package },
    ],
  },
  {
    title: "Nội dung",
    description: "Blog, kho ảnh và diễn đàn.",
    links: [
      { href: "/admin/posts", label: "Bài viết blog", icon: Newspaper },
      { href: "/admin/images", label: "Kho ảnh", icon: Images },
      { href: "/admin/forums", label: "Forum categories", icon: MessageSquareWarning },
    ],
  },
  {
    title: "Moderation",
    description: "Duyệt comment và quản lý user.",
    links: [
      { href: "/admin/comments", label: "Bình luận chờ duyệt", icon: MessageSquareWarning },
      { href: "/admin/users", label: "Người dùng", icon: Users },
    ],
  },
] as const;

const AdminDashboardTemplate = () => {
  return (
    <AdminGate nextPath="/admin">
      {({ user }) => (
        <Container className="py-8 sm:py-10">
          <div className="mb-8 max-w-2xl space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Admin dashboard
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Đăng nhập với{" "}
              <span className="font-medium text-foreground">{user.email}</span> · role{" "}
              <span className="font-medium text-foreground">{user.role}</span>
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <section
                key={section.title}
                className="space-y-4 rounded-[12px] border border-border bg-card p-5 shadow-sm"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 rounded-[12px] border border-border px-3 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-secondary"
                        >
                          <Icon className="size-4 text-muted-foreground" aria-hidden />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      )}
    </AdminGate>
  );
};

export default AdminDashboardTemplate;
