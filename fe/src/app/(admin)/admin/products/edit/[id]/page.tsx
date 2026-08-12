import type { Metadata } from "next";
import ProductEditorTemplate from "@/components/modules/ProductEditorTemplate";

export const metadata: Metadata = {
  title: "Cập nhật sản phẩm",
  robots: { index: false, follow: false },
};

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

const AdminProductEditPage = async ({ params }: AdminProductEditPageProps) => {
  const { id } = await params;
  return <ProductEditorTemplate mode="edit" productId={id} />;
};

export default AdminProductEditPage;
