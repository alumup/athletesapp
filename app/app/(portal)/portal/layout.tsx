"use client";
import { PortalUserNav } from "@/components/navigation/portal-user-nav";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SelectPerson from "./components/select-person";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-10 flex w-full justify-between border border-b border-gray-300 bg-gray-50 p-5">
        <Link href="/">
          <img src="/athletes-logo.svg" className="h-auto w-[50px]" />
        </Link>
        <PortalUserNav />
      </div>

      <div className="mx-auto w-full max-w-4xl mb-32">{children}</div>
    </>
  );
}
