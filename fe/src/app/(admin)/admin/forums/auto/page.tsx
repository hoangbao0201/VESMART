import type { Metadata } from "next";
import ForumAutoAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ForumAutoAdminPage";

export const metadata: Metadata = {
  title: "Admin · Forum Auto",
  robots: { index: false, follow: false },
};

const Page = () => <ForumAutoAdminPage />;

export default Page;
