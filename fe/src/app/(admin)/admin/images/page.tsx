import type { Metadata } from "next";
import ImagesAdminTemplate from "@/components/modules/ImagesAdminTemplate";

export const metadata: Metadata = {
  title: "Admin · Kho ảnh",
  robots: { index: false, follow: false },
};

const Page = () => <ImagesAdminTemplate />;

export default Page;
