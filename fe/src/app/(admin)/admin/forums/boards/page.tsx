import type { Metadata } from "next";
import ForumBoardsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ForumBoardsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Forums",
  robots: { index: false, follow: false },
};

const Page = () => <ForumBoardsAdminPage />;

export default Page;
