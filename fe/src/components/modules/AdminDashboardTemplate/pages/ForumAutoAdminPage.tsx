"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ForumAdminNav from "../components/ForumAdminNav";
import ForumAutoAdminSection from "../components/ForumAutoAdminSection";

const ForumAutoAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/forums/auto">
      {() => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Forum Auto"
            description="Scrape Facebook → tạo thread + replies trên forum."
          />
          <ForumAdminNav />
          <ForumAutoAdminSection />
        </Container>
      )}
    </AdminGate>
  );
};

export default ForumAutoAdminPage;
