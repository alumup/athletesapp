import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from 'next/link'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreateTeamModal from "@/components/modal/create-team-modal"

import { getAccount } from "@/lib/fetchers/server";

export default async function TeamsPage() {


  const supabase = createServerComponentClient({cookies});
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login");
  }

  const account = await getAccount() 

  const {data: teams, error} = await supabase
    .from('teams')
    .select('*')
    .eq('account_id', account.id)



  return(
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            Teams
            </h1>
          </div>
          <GenericButton cta="+ New Team">
            <CreateTeamModal account={account} />
          </GenericButton>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4">
          {teams.map((team) => (
            <Link href={`/teams/${team.id}`} key={team.id} className="col-span-1 border border-gray-100 px-3 rounded shadow flex space-x-5">
             <div className="flex flex-col space-y-1">
                <h2 className="font-cal text-lg font-bold dark:text-white sm:w-auto sm:text-2xl">
                  {team.name}
                </h2>
             </div>
            </Link>
          ))}

        </div>
      </div>
    </div>
  )
}