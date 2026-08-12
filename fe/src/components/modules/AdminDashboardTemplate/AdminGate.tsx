"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";

const STAFF_ROLES = new Set(["ADMIN", "MODERATOR"]);

type AdminGateProps = {
  children: (ctx: { user: NonNullable<ReturnType<typeof useAuth>["user"]>; isAdmin: boolean }) => ReactNode;
  /** Require ADMIN only (e.g. users). Default: ADMIN | MODERATOR. */
  adminOnly?: boolean;
  nextPath?: string;
};

const AdminGate = ({ children, adminOnly = false, nextPath = "/admin" }: AdminGateProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const isStaff = Boolean(user && STAFF_ROLES.has(user.role));
  const isAdmin = user?.role === "ADMIN";

  if (loading) {
    return (
      <Container className="py-8 sm:py-10">
        <p className="text-sm text-muted-foreground">Đang kiểm tra phiên đăng nhập…</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-8 sm:py-10">
        <EmptyState
          title="Cần đăng nhập"
          description="Đăng nhập bằng tài khoản ADMIN hoặc MODERATOR để mở trang quản trị."
        />
        <div className="mt-4 flex justify-center">
          <Button type="button" onClick={() => openAuth({ tab: "login", next: nextPath })}>
            Đăng nhập
          </Button>
        </div>
      </Container>
    );
  }

  if (!isStaff || (adminOnly && !isAdmin)) {
    return (
      <Container className="py-8 sm:py-10">
        <EmptyState
          title="Forbidden"
          description={
            adminOnly
              ? `Chỉ ADMIN mới truy cập được. Tài khoản hiện tại: ${user?.role ?? ""}.`
              : `Tài khoản ${user?.username ?? ""} không có quyền ADMIN/MODERATOR.`
          }
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/admin">Về Admin</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return <>{children({ user: user!, isAdmin })}</>;
};

export default AdminGate;
