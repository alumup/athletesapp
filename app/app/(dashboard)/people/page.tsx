import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePersonModal from "@/components/modal/create-person-modal";

import { DataTableDemo } from './table'

import { getAccount } from "@/lib/fetchers/server";


export default async function PeoplePage() {


  const supabase = createServerComponentClient({cookies});
  
  const { data: { user } } = await supabase.auth.getUser()


  if (!user) {
    redirect("/login");
  }


  const account = await getAccount() 

  console.log("ACCOUNT -------------> ",account)


  // Fetch people from Supabase
  const { data: people, error } = await supabase
    .from("people")
    .select("*");
  if (error) {
    console.error(error);
    return;
  }
      
  
  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
              People
            </h1>
          </div>
          <GenericButton cta="+ New Person">
            <CreatePersonModal account={account} />
          </GenericButton>
        </div>
        <div className="mt-10">
          <DataTableDemo data={people} />
        </div>
      </div>
    </div>
  );
}
