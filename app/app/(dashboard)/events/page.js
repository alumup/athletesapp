import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreateEventModal from "@/components/modal/create-event-modal";

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

  const { data: events, error } = await supabase.from("events").select("*");

  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="font-cal truncate text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
              Events
            </h1>
          </div>
          <GenericButton cta="+ New Event">
            <CreateEventModal account={account} />
          </GenericButton>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4">
          {events.map((event) => (
            <Link
              href={`/events/${event.id}`}
              key={event.id}
              className="col-span-1 flex space-x-5 rounded border border-gray-100 px-3 shadow"
            >
              <div className="flex flex-col space-y-1">
                <h2 className="font-cal text-lg font-bold dark:text-white sm:w-auto sm:text-2xl">
                  {event.name}
                </h2>
                <p className="text-sm font-light dark:text-white sm:w-auto sm:text-base">
                  {event.location?.name}
                </p>
                <p className="text-sm font-light dark:text-white sm:w-auto sm:text-base">
                  {event.schedule?.start_date} - {event.schedule?.end_date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
