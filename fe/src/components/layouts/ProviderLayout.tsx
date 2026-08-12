"use client";

import AuthModal from "@/components/modules/AuthModal";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import { CartProvider } from "@/hooks/useCart";
import NextTopLoader from "nextjs-toploader";

type ProviderLayoutProps = {
  children: React.ReactNode;
};

/**
 * App-wide providers shell.
 * Theme is applied via ThemeToggle + localStorage (no extra theme library).
 */
const ProviderLayout = ({ children }: ProviderLayoutProps) => {
  return (
    <>
      <NextTopLoader
        color="#2563ebcc"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
      />
      <AuthProvider>
        <AuthModalProvider>
          <CartProvider>{children}</CartProvider>
          <AuthModal />
        </AuthModalProvider>
      </AuthProvider>
    </>
  );
};

export default ProviderLayout;
