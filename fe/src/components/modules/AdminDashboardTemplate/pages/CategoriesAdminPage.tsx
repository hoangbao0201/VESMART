"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import CategoriesAdminSection from "../components/CategoriesAdminSection";

const CategoriesAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/categories">
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Danh mục sản phẩm"
            description="Cây danh mục catalog."
          />
          <CategoriesAdminSection canCreate={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default CategoriesAdminPage;
