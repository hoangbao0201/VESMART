"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import PostsAdminSection from "../components/PostsAdminSection";

const PostsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/posts">
      {() => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Bài viết blog"
            description="Danh sách bài viết và liên kết chỉnh sửa."
          />
          <PostsAdminSection />
        </Container>
      )}
    </AdminGate>
  );
};

export default PostsAdminPage;
