import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { MainNav } from "@/components/navigation/main-nav";
import { UserNav } from "@/components/navigation/user-nav";
import Link from "next/link";
import Image from "next/image";


export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {


  const supabase = await createClient();

  return (
    <>
      <div className="sticky top-0 z-50 flex-col bg-gray-50 md:flex">
        <div className="border-b">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex h-16 items-center px-4">
              <Link href="/">
                <Image src="/logo.svg" width={50} height={50} alt="Bulldog Logo" />
              </Link>
              <MainNav className="mx-6" />
              <div className="ml-auto flex items-center space-x-4">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto my-10 min-h-screen w-full max-w-screen-2xl px-4">
        {children}
      </div>
      <div className="bg-black text-white flex flex-col space-y-6 py-8">
        <h1 className="font-cal text-sm text-center font-mono">©  Provo Basketball Club {new Date().getFullYear()}</h1>
      </div>
    </>
  );
}
