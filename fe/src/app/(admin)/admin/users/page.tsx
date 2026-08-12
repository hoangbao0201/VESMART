import type { Metadata } from "next";
import UsersAdminPage from "@/components/modules/AdminDashboardTemplate/pages/UsersAdminPage";

export const metadata: Metadata = {
  title: "Admin · Người dùng",
  robots: { index: false, follow: false },
};

const Page = () => <UsersAdminPage />;

export default Page;
