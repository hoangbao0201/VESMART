"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/products", label: "Sản phẩm" },
  { href: "/blog", label: "Bài viết" },
  { href: "/images", label: "Kho ảnh" },
  { href: "/forum", label: "Diễn đàn" },
] as const;

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const { itemCount, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const cartBadge = hydrated && itemCount > 0 ? itemCount : 0;

  const onLogout = async () => {
    await logout();
    setOpen(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            VESMART
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[12px] px-3 py-2 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Tìm kiếm">
            <Link href="/search">
              <Search className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative">
            <Link href="/cart">
              <ShoppingCart className="size-4" aria-hidden />
              {cartBadge > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                  {cartBadge > 99 ? "99+" : cartBadge}
                </span>
              ) : null}
            </Link>
          </Button>
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            {loading ? (
              <span className="px-2 text-xs text-muted-foreground">…</span>
            ) : isAuthenticated && user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/account/favorites" className="inline-flex items-center gap-1.5">
                    <Heart className="size-3.5" aria-hidden />
                    Yêu thích
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/u/${user.username}`} className="inline-flex items-center gap-2">
                    <UserAvatar username={user.username} avatar={user.avatar} size="sm" />
                    <span className="max-w-28 truncate">{user.username}</span>
                  </Link>
                </Button>
                {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={() => void onLogout()}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuth("login")}
                >
                  Đăng nhập
                </Button>
                <Button type="button" size="sm" onClick={() => openAuth("register")}>
                  Đăng ký
                </Button>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </Button>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-border md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            <nav className="flex flex-col" aria-label="Điều hướng mobile">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[12px] px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/cart"
                className="rounded-[12px] px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                onClick={() => setOpen(false)}
              >
                Giỏ hàng{cartBadge > 0 ? ` (${cartBadge})` : ""}
              </Link>
            </nav>
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3 sm:hidden">
              {isAuthenticated && user ? (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/account/favorites" onClick={() => setOpen(false)}>
                      Yêu thích
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/u/${user.username}`} onClick={() => setOpen(false)}>
                      Hồ sơ @{user.username}
                    </Link>
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => void onLogout()}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setOpen(false);
                      openAuth("login");
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                      setOpen(false);
                      openAuth("register");
                    }}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
