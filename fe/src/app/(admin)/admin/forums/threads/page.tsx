import type { Metadata } from "next";
import ForumThreadsAdminPage from "@/components/modules/AdminDashboardTemplate/pages/ForumThreadsAdminPage";

export const metadata: Metadata = {
  title: "Admin · Threads",
  robots: { index: false, follow: false },
};

const Page = () => <ForumThreadsAdminPage />;

export default Page;
