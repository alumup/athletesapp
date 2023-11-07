import { ReactNode, Suspense } from "react";
import Image from "next/image";
import { MainNav } from "@/components/navigation/main-nav";
import { UserNav } from "@/components/navigation/user-nav";
import { Search } from "@/components/navigation/search";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cookies } from 'next/headers'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
export const dynamic = 'force-dynamic'
export default async function DashboardLayout({ children }: { children: ReactNode }) {

  const supabase = createServerComponentClient({cookies})

  const { data: { session }, error } = await supabase.auth.getSession()


  if (error) {
    console.error(error);
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }


  return (
    <>
      {/* <Nav>
        <Suspense fallback={<div>Loading...</div>}>
          <Profile />
        </Suspense>
      </Nav> */}
      <div className="sticky top-0 bg-gray-50 z-50 flex-col md:flex">
        <div className="border-b">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex h-16 items-center px-4">
              <Link
                href="/"
              >
               <img src="/athletes.svg" className="w-[125px] h-auto" />
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
      <div className="px-4 my-10 max-w-screen-2xl mx-auto w-full min-h-screen">{children}</div>
    </>
  );
}
