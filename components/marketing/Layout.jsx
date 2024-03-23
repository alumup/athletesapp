import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";

export function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-auto">{children}</main>
      <Footer />
    </>
  );
}
