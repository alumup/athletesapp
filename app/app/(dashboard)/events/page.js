import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreateEventModal from "@/components/modal/create-event-modal";
import { EventsTable } from "./table";

import { getAccount } from "@/lib/fetchers/server";

export default async function EventsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const account = await getAccount();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq('account_id', account.id)
  // .is("parent_id", null);

  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="font-cal truncate text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
              Events
            </h1>
          </div>
          <GenericButton cta="+ New Event" classNames="">
            <CreateEventModal account={account} />
          </GenericButton>
        </div>
        <div className="mt-10">
          {events && <EventsTable data={events} account={account} />}
        </div>
      </div>
    </div>
  );
}
