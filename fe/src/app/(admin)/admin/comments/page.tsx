import type { Metadata } from "next";
import CommentsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/CommentsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Bình luận",
  robots: { index: false, follow: false },
};

const Page = () => <CommentsAdminPage />;

export default Page;
