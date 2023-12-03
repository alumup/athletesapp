
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getAccount } from "@/lib/fetchers/server";
import { getPrimaryContacts } from "@/lib/fetchers/server";


import { TeamTable } from './table'

export default async function TeamPage({
  params
}: {
  params: { id: string }
}) {

  const supabase = createServerComponentClient({cookies})

  const account = await getAccount();

    async function fetchTeam() {
      const { data: team, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error(error);
        return;
      }

      
      return team
    }

    async function fetchRoster() {
      const { data, error } = await supabase
        .from("rosters")
        .select("*, fees(*, payments(*)),people(*)")
        .eq("team_id", params.id)

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      console.log("ROSTERS SUCCESSFULLY GATHERED")
    }
    
    return data
    }




    const team = await fetchTeam()
    const roster = await fetchRoster() || [];

    // const account = await getAccount();

  
  const peopleWithPrimaryEmailPromises = roster?.map(async (r) => {
    const primaryPeople = await getPrimaryContacts(r.people);
    return {
      ...r.people,
      primary_contacts: primaryPeople,
      fees: r.fees || {
        id: '',
        name: '',
        description: '',
        amount: null,
        type: ''
      },
    };
  });

  const peopleWithPrimaryEmail = await Promise.all(peopleWithPrimaryEmailPromises);


  
  return (
    <div className="flex flex-col space-y-12">
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col space-y-0.5">
          <h1 className="truncate font-cal text-base md:text-3xl font-bold sm:w-auto sm:text-2xl">
            {team?.name}
          </h1>
          <p className="text-sm text-gray-700">
            {team?.coach}
          </p> 

        </div>
        {/* <GenericButton cta="Edit Person">
          <EditPersonModal person={person} account={account} />
        </GenericButton> */}

      </div>
      <div className="mt-10">
        <h2 className="mb-3 font-bold text-zinc-500 text-xs uppercase">Roster</h2>
        
          <TeamTable data={peopleWithPrimaryEmail} team={team} account={account} />
      </div>
    </div>
  </div>
  
  )
}