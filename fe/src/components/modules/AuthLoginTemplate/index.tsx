"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import { useAuthModal } from "@/hooks/useAuthModal";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

const AuthLoginTemplate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    const next = safeNextPath(searchParams.get("next"));
    openAuth({ tab: "login", next });
    router.replace("/");
  }, [openAuth, router, searchParams]);

  return (
    <Container className="py-10 sm:py-14">
      <p className="text-center text-sm text-muted-foreground">Đang mở đăng nhập…</p>
    </Container>
  );
};

export default AuthLoginTemplate;
