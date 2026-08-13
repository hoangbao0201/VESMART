"use client";

import Link from "next/link";
import {
  FolderTree,
  LayoutList,
  MessageSquare,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumAdminNav from "../components/ForumAdminNav";

const CARDS = [
  {
    href: "/admin/forums/auto",
    title: "Forum Auto",
    description: "Nhập nội dung + URL Facebook → tạo thread và replies.",
    icon: Sparkles,
  },
  {
    href: "/admin/forums/categories",
    title: "Categories",
    description: "Nhóm diễn đàn: thêm / sửa / xóa.",
    icon: FolderTree,
  },
  {
    href: "/admin/forums/boards",
    title: "Forums",
    description: "Diễn đàn con trong từng category.",
    icon: LayoutList,
  },
  {
    href: "/admin/forums/threads",
    title: "Threads",
    description: "Chủ đề: tạo, ghim, khóa, ẩn, xóa.",
    icon: MessagesSquare,
  },
  {
    href: "/admin/forums/posts",
    title: "Posts",
    description: "Reply: xem, sửa, xóa theo thread.",
    icon: MessageSquare,
  },
] as const;

const ForumsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums">
      {() => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Forum"
            description="Chọn mục cần quản lý. Mỗi phần một trang list riêng."
          />
          <ForumAdminNav />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.href}>
                  <Link
                    href={card.href}
                    className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="size-4 text-muted-foreground" aria-hidden />
                      {card.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{card.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      )}
    </AdminGate>
  );
};

export default ForumsAdminPage;
