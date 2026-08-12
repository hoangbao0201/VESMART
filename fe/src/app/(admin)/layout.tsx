import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/admin" className="shrink-0 text-sm font-semibold">
              VESMART Admin
            </Link>
            <nav className="hidden items-center gap-3 overflow-x-auto text-xs text-muted-foreground md:flex">
              <Link href="/admin/products" className="hover:text-foreground">
                Sản phẩm
              </Link>
              <Link href="/admin/posts" className="hover:text-foreground">
                Bài viết
              </Link>
              <Link href="/admin/images" className="hover:text-foreground">
                Kho ảnh
              </Link>
              <Link href="/admin/comments" className="hover:text-foreground">
                Bình luận
              </Link>
            </nav>
          </div>
          <Link href="/" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">
            Về trang chủ
          </Link>
        </Container>
      </header>
      <main id="main-content">{children}</main>
    </div>
  );
};

export default AdminLayout;
