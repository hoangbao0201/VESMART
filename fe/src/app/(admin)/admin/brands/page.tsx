import type { Metadata } from "next";
import BrandsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/BrandsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Thương hiệu",
  robots: { index: false, follow: false },
};

const Page = () => <BrandsAdminPage />;

export default Page;
