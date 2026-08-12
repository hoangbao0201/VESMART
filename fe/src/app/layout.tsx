import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import ProviderLayout from "@/components/layouts/ProviderLayout";
import { SITE_CONFIG } from "@/configs/site.config";
import { getPublicSiteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VESMART - Sửa chữa robot hút bụi Đà Nẵng",
    template: "%s · VESMART",
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/static/icons/android/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      { url: SITE_CONFIG.icon, sizes: "192x192", type: "image/png" },
    ],
    apple: [
      {
        url: "/static/icons/ios/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  themeColor: SITE_CONFIG.themeColor,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_CONFIG.name,
    url: siteUrl,
    title: "VESMART - Sửa chữa robot hút bụi Đà Nẵng",
    description: SITE_CONFIG.description,
    images: [{ url: SITE_CONFIG.logo, alt: SITE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.logo],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("vesmart-theme")?.value;
  const isDark = theme === "dark";

  return (
    <html
      lang="vi"
      className={cn(inter.variable, "h-full", isDark && "dark")}
      style={{ colorScheme: isDark ? "dark" : "light" }}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased">
        <ProviderLayout>{children}</ProviderLayout>
      </body>
    </html>
  );
}
