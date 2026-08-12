import { Suspense } from "react";
import type { Metadata } from "next";
import AuthLoginTemplate from "@/components/modules/AuthLoginTemplate";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <Container className="py-10 sm:py-14">
          <p className="text-center text-sm text-muted-foreground">Đang tải…</p>
        </Container>
      }
    >
      <AuthLoginTemplate />
    </Suspense>
  );
};

export default LoginPage;
