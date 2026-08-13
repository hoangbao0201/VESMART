"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumAdminNav from "../components/ForumAdminNav";
import ThreadsAdminSection from "../components/ThreadsAdminSection";

const ForumThreadsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums/threads">
      {() => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Threads"
            description="Quản lý chủ đề: tạo, sửa, ghim, khóa, ẩn, xóa."
          />
          <ForumAdminNav />
          <ThreadsAdminSection canCreate />
        </Container>
      )}
    </AdminGate>
  );
};

export default ForumThreadsAdminPage;
