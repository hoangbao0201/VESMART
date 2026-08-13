"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumAdminNav from "../components/ForumAdminNav";
import ForumPostsAdminSection from "../components/ForumPostsAdminSection";

const ForumPostsAdminPageInner = () => {
  const searchParams = useSearchParams();
  const threadIdRaw = searchParams.get("threadId");
  const threadId = threadIdRaw ? Number(threadIdRaw) : null;
  const threadTitle = searchParams.get("title");

  return (
    <Container className="py-8 sm:py-10">
      <AdminPageHeader
        title="Forum posts"
        description="Quản lý replies. Lọc theo thread từ trang Threads hoặc xem tất cả."
      />
      <ForumAdminNav />
      <ForumPostsAdminSection
        selectedThread={
          threadId && Number.isFinite(threadId)
            ? {
                id: threadId,
                slug: "",
                title: threadTitle || `Thread #${threadId}`,
                views: 0,
                replyCount: 0,
                isPinned: false,
                isLocked: false,
                lastReplyAt: null,
                createdAt: "",
              }
            : null
        }
      />
    </Container>
  );
};

const ForumPostsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums/posts">
      {() => (
        <Suspense
          fallback={
            <Container className="py-8 sm:py-10">
              <p className="text-sm text-muted-foreground">Đang tải…</p>
            </Container>
          }
        >
          <ForumPostsAdminPageInner />
        </Suspense>
      )}
    </AdminGate>
  );
};

export default ForumPostsAdminPage;
