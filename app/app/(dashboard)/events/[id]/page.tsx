
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getAccount } from "@/lib/fetchers/server";


import { EventTable } from './table'

export default async function EventPage({
  params
}: {
  params: { id: string }
}) {

  const supabase = createServerComponentClient({cookies})


    async function fetchEvent() {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error(error);
        return;
      }

      
      return events
    }

    async function fetchParticipants() {
      const { data, error } = await supabase
        .from("participants")
        .select("*, people(*)")
        .eq("event_id", params.id)

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      console.log(data)
    }
    
    return data
    }




    const event = await fetchEvent()
    const participants = await fetchParticipants();

    const account = await getAccount();

    const people = participants?.map(participant => participant.people) || [];
    


  
  return (
    <div className="flex flex-col space-y-12">
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col space-y-0.5">
          <h1 className="truncate font-cal text-base md:text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            {event.name}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
              {event.location.name}
            </p>
        </div>

      </div>
      <div className="mt-10">
        <h2 className="mb-3 font-bold text-zinc-500 text-xs uppercase">Participants</h2>
        
        <EventTable data={people} account={account} />
      </div>
    </div>
  </div>
  
  )
}