"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import { SITE_CONFIG, sitePhoneTelHref } from "@/configs/site.config";
import { useAuthModal } from "@/hooks/useAuthModal";

const FOOTER_LINKS = [
  {
    title: "Khám phá",
    links: [
      { href: "/products", label: "Sản phẩm" },
      { href: "/blog", label: "Bài viết" },
      { href: "/images", label: "Kho ảnh" },
      { href: "/forum", label: "Diễn đàn" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/search", label: "Tìm kiếm" },
      { href: "/forum", label: "Hỏi đáp cộng đồng" },
    ],
  },
] as const;

const Footer = () => {
  const year = new Date().getFullYear();
  const { openAuth } = useAuthModal();

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-semibold tracking-tight">{SITE_CONFIG.name}</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {SITE_CONFIG.description}
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <a href={sitePhoneTelHref()} className="hover:text-foreground">
                {SITE_CONFIG.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-foreground">
                {SITE_CONFIG.email}
              </a>
            </li>
            <li>{SITE_CONFIG.address}</li>
            <li className="flex flex-wrap gap-3 pt-1">
              <a
                href={SITE_CONFIG.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary"
              >
                Facebook
              </a>
              <a
                href={SITE_CONFIG.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary"
              >
                TikTok
              </a>
            </li>
          </ul>
        </div>
        {FOOTER_LINKS.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Tài khoản</p>
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => openAuth("login")}
              >
                Đăng nhập
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => openAuth("register")}
              >
                Đăng ký
              </button>
            </li>
            <li>
              <Link
                href="/account/favorites"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Yêu thích
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p>Review · Ecommerce · Bài viết · Forum</p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
