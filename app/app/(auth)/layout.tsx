import { Metadata } from "next";
import { ReactNode } from "react";
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: "Login | Jumpshot®",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen justify-center items-center py-12 px-3 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
