"use client";
import { PortalUserNav } from "@/components/navigation/portal-user-nav";
import Link from "next/link";
import { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-50 flex-col bg-gray-50 md:flex">
        <div className="border-b">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex h-16 items-center px-4">
              <Link href="/">
                <img src="/athletes-logo.svg" className="h-auto w-[50px]" />
              </Link>
              <div className="ml-auto flex items-center space-x-4">
                <PortalUserNav />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto my-10 min-h-screen w-full max-w-screen-2xl px-4">
        {children}
      </div>
    </>
  );
}
