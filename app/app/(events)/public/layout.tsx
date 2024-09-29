"use client";
import Link from "next/link";
import { ReactNode, useEffect } from "react";
import Image from "next/image";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-50 flex-col bg-gray-50 md:flex">
        <div className="border-b">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex h-16 items-center px-4">
              <Link href="/">
                <Image
                  src="/athletes-logo.svg"
                  alt="Athletes Logo"
                  className="h-auto w-[50px]"
                  width={50}
                  height={50}
                />
              </Link>
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
