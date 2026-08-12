"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useAuthModal } from "@/hooks/useAuthModal";

const AuthRegisterTemplate = () => {
  const router = useRouter();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    openAuth({ tab: "register", next: "/" });
    router.replace("/");
  }, [openAuth, router]);

  return (
    <Container className="py-10 sm:py-14">
      <p className="text-center text-sm text-muted-foreground">Đang mở đăng ký…</p>
    </Container>
  );
};

export default AuthRegisterTemplate;
