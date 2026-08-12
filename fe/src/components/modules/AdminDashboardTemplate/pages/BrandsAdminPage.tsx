"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import BrandsAdminSection from "../components/BrandsAdminSection";

const BrandsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/brands">
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Thương hiệu"
            description="Danh sách brand và tạo mới."
          />
          <BrandsAdminSection canCreate={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default BrandsAdminPage;
