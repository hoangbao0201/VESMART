import type { Metadata } from "next";
import ProductEditorTemplate from "@/components/modules/ProductEditorTemplate";

export const metadata: Metadata = {
  title: "Tạo sản phẩm",
  robots: { index: false, follow: false },
};

const AdminProductCreatePage = () => {
  return <ProductEditorTemplate mode="create" />;
};

export default AdminProductCreatePage;
