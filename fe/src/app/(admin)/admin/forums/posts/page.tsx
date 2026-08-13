import type { Metadata } from "next";
import ForumPostsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ForumPostsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Forum posts",
  robots: { index: false, follow: false },
};

const Page = () => <ForumPostsAdminPage />;

export default Page;
