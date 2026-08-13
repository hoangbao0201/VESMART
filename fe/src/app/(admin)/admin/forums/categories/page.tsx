import type { Metadata } from "next";
import ForumCategoriesAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ForumCategoriesAdminPage";

export const metadata: Metadata = {
  title: "Admin · Forum categories",
  robots: { index: false, follow: false },
};

const Page = () => <ForumCategoriesAdminPage />;

export default Page;
