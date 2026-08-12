"use client";

import Container from "@/components/ui/Container";
import AdminGate from "../AdminGate";
import AdminPageHeader from "../AdminPageHeader";
import ProductsAdminSection from "../components/ProductsAdminSection";

const ProductsAdminPage = () => {
  return (
    <AdminGate nextPath="/admin/products">
      {({ isAdmin }) => (
        <Container className="py-8 sm:py-10">
          <AdminPageHeader
            title="Sản phẩm"
            description="Quản lý catalog SPU/SKU."
          />
          <ProductsAdminSection canCreate={isAdmin} />
        </Container>
      )}
    </AdminGate>
  );
};

export default ProductsAdminPage;
