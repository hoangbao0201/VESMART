"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumAdminNav from "../components/ForumAdminNav";
import ForumsAdminSection from "../components/ForumsAdminSection";

const ForumBoardsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums/boards">
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Forums"
            description="Diễn đàn con: thêm / sửa / xóa (ADMIN)."
          />
          <ForumAdminNav />
          <ForumsAdminSection canManage={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default ForumBoardsAdminPage;
