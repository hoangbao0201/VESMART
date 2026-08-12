"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import UsersAdminSection from "../components/UsersAdminSection";

const UsersAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/users" adminOnly>
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Người dùng"
            description="Danh sách tài khoản (chỉ ADMIN)."
          />
          <UsersAdminSection canView={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default UsersAdminPage;
