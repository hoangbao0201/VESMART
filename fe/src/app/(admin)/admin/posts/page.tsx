import type { Metadata } from "next";
import PostsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/PostsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Bài viết",
  robots: { index: false, follow: false },
};

const Page = () => <PostsAdminPage />;

export default Page;
