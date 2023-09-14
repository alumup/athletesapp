

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { getAccount } from "@/lib/fetchers/server";
import GenericButton from "@/components/modal-buttons/generic-button";
import EditPersonModal from "@/components/modal/edit-person-modal";
import { fullName } from "@/lib/utils";

export default async function PersonPage({
  params
}: {
  params: { id: string }
}) {

  const supabase = createServerComponentClient({cookies})


    async function fetchPerson() {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error(error);
        return;
      }

      
      return data
    }

    async function fetchRelationships() {
      const { data, error } = await supabase
        .from("relationships")
        .select("*,from:person_id(*),to:relation_id(*)")
        .eq("person_id", params.id)

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      console.log(data)
    }
    
    return data
    }

    const person = await fetchPerson()
    const relationships = await fetchRelationships();
    const account = await getAccount();

    
    console.log("GUARDIANS", relationships)

  
  return (
    <div className="flex flex-col space-y-12">
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col space-y-0.5">
          <h1 className="truncate font-cal text-base md:text-lg font-bold dark:text-white sm:w-auto sm:text-3xl">
            {person?.name || fullName(person)}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
              {person?.email}
            </p>
        </div>
        <GenericButton cta="Edit Person">
          <EditPersonModal person={person} account={account} />
        </GenericButton>

      </div>
      <div className="mt-10">
  
        {relationships?.map((relation, i) => (
          <div key={i}>
            <div className="border border-stone-200 px-3 py-2 rounded flex items-center space-x-1">
              <div className="flex flex-col">
                <span>{relation.name} of</span>
                <Link href={`/people/${relation.to.id}`} className="font-bold text-sm">{relation.to.name || fullName(relation.to)}</Link>
              </div>
            </div>
          </div>
        ))}
    

        
      </div>
    </div>
  </div>
  
  )
}