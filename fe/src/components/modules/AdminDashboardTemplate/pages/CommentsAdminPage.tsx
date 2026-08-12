"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import CommentsAdminSection from "../components/CommentsAdminSection";

const CommentsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/comments">
      {() => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Bình luận"
            description="Duyệt bình luận chờ phê duyệt."
          />
          <CommentsAdminSection />
        </Container>
      )}
    </AdminGate>
  );
};

export default CommentsAdminPage;
