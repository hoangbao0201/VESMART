"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumCategoriesAdminSection from "../components/ForumCategoriesAdminSection";

const ForumsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums">
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Forum categories"
            description="Danh mục diễn đàn."
          />
          <ForumCategoriesAdminSection canCreate={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default ForumsAdminPage;
