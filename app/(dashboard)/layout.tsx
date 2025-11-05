import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { MainNav } from "@/components/navigation/main-nav";
import { UserNav } from "@/components/navigation/user-nav";
import { Search } from "@/components/navigation/search";
import Link from "next/link";


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
                <img src="/logo.svg" className="h-auto w-[50px]" alt="Bulldog Logo" />
              </Link>
              <MainNav className="mx-6" />
              <div className="ml-auto flex items-center space-x-4">
                <Search />
                <UserNav />
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
