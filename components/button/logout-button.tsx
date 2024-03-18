"use client";

import { LogOut } from "lucide-react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out: ", error.message);
}

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-lg p-1.5 text-stone-700 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
    >
      <LogOut width={18} />
    </button>
  );
}
