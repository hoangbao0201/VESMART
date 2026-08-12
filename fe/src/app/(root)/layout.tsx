import Footer from "@/components/partials/Footer";
import Header from "@/components/partials/Header";
import FloatingContact from "@/components/ui/FloatingContact";

const RootGroupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
};

export default RootGroupLayout;
