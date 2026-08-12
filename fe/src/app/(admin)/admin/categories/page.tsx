import type { Metadata } from "next";
import CategoriesAdminPage from "@/components/modules/AdminDashboardTemplate/pages/CategoriesAdminPage";

export const metadata: Metadata = {
  title: "Admin · Danh mục",
  robots: { index: false, follow: false },
};

const Page = () => <CategoriesAdminPage />;

export default Page;
