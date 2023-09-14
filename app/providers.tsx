"use client";


import { Toaster } from "sonner";
import { ModalProvider } from "@/components/modal/provider";
import FormProvider from "@/providers/form-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FormProvider>
      <Toaster className="dark:hidden" />
      <Toaster theme="dark" className="hidden dark:block" />
      <ModalProvider>{children}</ModalProvider>
    </FormProvider>
  );
}
