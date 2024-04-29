"use client";
import { PortalUserNav } from "@/components/navigation/portal-user-nav";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SelectPerson from "./components/select-person";

export default function PortalLayout({ children }: { children: ReactNode }) {
 
 
  return (
    <>
      <div className="w-full sticky top-0 flex justify-between bg-gray-50 border border-b border-gray-300 p-5">
        <Link href="/">
          <img src="/athletes-logo.svg" className="h-auto w-[50px]" />
        </Link>
        <PortalUserNav />
      </div>

      <div className="w-full max-w-2xl mx-auto">
        {children}
      </div>
    </>
  );
}


