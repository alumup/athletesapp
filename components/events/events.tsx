"use client";

import { formatDate, formatTimeRange } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AlarmClock, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

export default function AccountEvents({ dependent, profile }: any) {
  const supabase = createClientComponentClient();
  const [events, setEvents] = useState<any>([]);
  useEffect(() => {
    const getEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*,accounts(*), fees(*), rsvp(*)")
        .eq("account_id", dependent?.to?.accounts?.id);

      if (error) console.log("ERROR getting events: ", error);
      else {
        setEvents(data);
        console.log(data, "<<< evgents\n\n");
      }
    };

    if (dependent) getEvents();
  }, [dependent]);

  return (
    <div>
      <div className="flex justify-between space-x-2 overflow-x-auto">
        {events?.map((event: any) => (
          <div key={event.id} className="flex h-64">
            <div className="flex items-center justify-center rounded-l-lg bg-lime-200 p-4">
              <div className="mb-2 text-center">
                <span className="text-bold">
                  {formatDate(event?.schedule?.start_date)}
                </span>
              </div>
            </div>

            <div className="flex w-64 flex-col justify-between rounded-r-lg bg-lime-50 p-4">
              <h2 className="mb-2 pr-5 pt-5 text-lg font-semibold">
                {event.name}
              </h2>

              <div className="flex items-center space-x-2">
                <AlarmClock className="h-5 w-5" />
                <span className="mr-2">
                  {event?.schedule
                    ? formatTimeRange(
                        event?.schedule?.sessions?.[0]?.start_time || "",
                        event?.schedule?.sessions?.[0]?.end_time || "",
                      )
                    : ""}
                </span>
              </div>
              <div className="mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{event?.location?.name}</span>
              </div>

              <Link
                href={`/portal/events/${event.id}/rsvp`}
                className="w-24 self-end rounded bg-black px-6 py-2 font-bold text-white"
              >
                RSVP
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="my-2">
        <Link
          href={`/portal/events/${profile?.accounts?.id}`}
          className="text-gray-600"
        >
          See All Events
        </Link>
      </div>
    </div>
  );
}
