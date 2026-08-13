"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumAdminNav from "../components/ForumAdminNav";
import ForumCategoriesAdminSection from "../components/ForumCategoriesAdminSection";

const ForumCategoriesAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums/categories">
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Forum categories"
            description="Nhóm diễn đàn: thêm / sửa / xóa (ADMIN)."
          />
          <ForumAdminNav />
          <ForumCategoriesAdminSection canManage={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default ForumCategoriesAdminPage;
