import { Metadata } from "next";
import { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Login | Jumpshot®",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen items-center justify-center px-3 py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
