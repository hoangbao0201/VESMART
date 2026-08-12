import type { Metadata } from "next";
import AuthRegisterTemplate from "@/components/modules/AuthRegisterTemplate";

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false, follow: false },
};

const RegisterPage = () => {
  return <AuthRegisterTemplate />;
};

export default RegisterPage;
