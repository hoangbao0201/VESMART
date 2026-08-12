import type { Metadata } from "next";
import Footer from "@/components/partials/Footer";
import Header from "@/components/partials/Header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default AccountLayout;
