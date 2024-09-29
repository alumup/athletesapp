import { PortalUserNav } from "@/components/navigation/portal-user-nav";
import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-10 flex w-full justify-between border border-b border-gray-300 bg-gray-50 p-5">
        <Link href="/">
          <Image
            src="/athletes-logo.svg"
            alt="Athletes Logo"
            className="h-auto w-[50px]"
            width={50}
            height={50}
          />
        </Link>
        <PortalUserNav />
      </div>

      <div className="mx-auto mb-32 w-full max-w-4xl">{children}</div>
    </>
  );
}
