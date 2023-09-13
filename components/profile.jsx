import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./button/logout-button";

export default async function Profile() {
  const supabase = createServerComponentClient({ cookies });
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex w-full items-center justify-between">
      <Link
        href="/settings"
        className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
      >
        <span className="truncate text-sm font-medium">
          {user.email}
        </span>
      </Link>
      <LogoutButton />
    </div>
  );
}
