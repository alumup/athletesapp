"use client";


import { Toaster } from "sonner";
import { ModalProvider } from "@/components/modal/provider";
import { Next13ProgressBar } from "next13-progressbar";
import { ShopifyProvider } from "@/components/shopify-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster className="dark:hidden" />
      <Toaster theme="dark" className="hidden dark:block" />
      <Next13ProgressBar
        height="2px"
        color="#000"
        options={{ showSpinner: false }}
        showOnShallow
      />
      <ShopifyProvider>
        <ModalProvider>{children}</ModalProvider>
      </ShopifyProvider>
    </>
  );
}
