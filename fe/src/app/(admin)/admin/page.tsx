import type { Metadata } from "next";
import AdminDashboardTemplate from "@/components/modules/AdminDashboardTemplate";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const AdminPage = () => {
  return <AdminDashboardTemplate />;
};

export default AdminPage;
