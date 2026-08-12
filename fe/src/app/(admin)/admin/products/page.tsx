import type { Metadata } from "next";
import ProductsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ProductsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Sản phẩm",
  robots: { index: false, follow: false },
};

const Page = () => <ProductsAdminPage />;

export default Page;
