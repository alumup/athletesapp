"use client";
import { PortalUserNav } from "@/components/navigation/portal-user-nav";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SelectPerson from "./components/select-person";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-0 flex w-full justify-between border border-b border-gray-300 bg-gray-50 p-5">
        <Link href="/">
          <img src="/athletes-logo.svg" className="h-auto w-[50px]" />
        </Link>
        <PortalUserNav />
      </div>

      <div className="mx-auto w-full max-w-2xl">{children}</div>
      <div className="bg-black w-full h-32 flex items-center justify-center p-5">
        <span className="uppercase text-xs font-bold text-gray-300">Powered by Athletes App®</span>
      </div>
    </>
  );
}
