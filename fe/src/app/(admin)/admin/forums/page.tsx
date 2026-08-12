import type { Metadata } from "next";
import ForumsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ForumsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Forum",
  robots: { index: false, follow: false },
};

const Page = () => <ForumsAdminPage />;

export default Page;
