"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getAccountWithDomain } from "@/lib/fetchers/client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, LogOut, Plus, Settings, User, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function PortalUserNav() {
  const params = useParams();
  const [account, setAccount] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAccount = async () => {
      const acc = await getAccountWithDomain(
        (params.domain as string) || (params.subdomain as string),
      );
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setAccount(acc);
      setUser(u);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*), people(*)")
        .eq("id", u?.id)
        .single();

      setProfile(profile);
    };

    fetchAccount();
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out: ", error.message);
    if (!error) {
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-8 w-8 rounded-full border border-gray-300">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-black">
              {getInitials(
                user?.user_metadata?.first_name,
                user?.user_metadata?.last_name,
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-50 w-56 bg-white"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{account?.name}</p>
            <p className="text-xs leading-none text-zinc-700">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-3 w-3" />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-3 w-3" />
            <Link href={`/portal/invoices/${profile?.id}`}>Payments</Link>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-3 w-3" />
            <Link href={`/portal/${user?.id}/settings`}>Settings</Link>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-3 w-3" />
            <Link href={`/portal/dependants/${profile?.people_id}`}>
              Dependents
            </Link>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus className="mr-2 h-3 w-3" />
            New Dependent
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-3 w-3" />
            Programs
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus className="mr-2 h-3 w-3" />
            New Program
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuItem className="hover:bg-gray-100">
          <LogOut className="mr-2 h-3 w-3" />
          <button
            onClick={() => logout()}
            className="flex w-full cursor-pointer justify-start bg-white"
          >
            Log out
          </button>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
