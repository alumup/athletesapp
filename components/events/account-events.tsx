"use client";

import { formatStartTime, formatDay, formatMonth } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AlarmClock, CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountEvents({ dependent, events }: any) {
  const supabase = createClientComponentClient();
  // const [events, setEvents] = useState<any>([]);
  const [isGoing, setIsGoing] = useState<boolean>(false);

  // useEffect(() => {
  //   const getEvents = async () => {
  //     const { data, error } = await supabase
  //       .from("events")
  //       .select("*,accounts(*), fees(*), rsvp(*), parent_id(*)")
  //       .gte("date", new Date().toISOString())
  //       .eq("account_id", dependent?.to?.accounts?.id)
  //       .order("date", { ascending: true });

  //     if (error) console.log("ERROR getting events: ", error);
  //     else {
  //       setEvents(data);
  //       console.log(data, "--- events data --- events.tsx");
  //     }
  //   };

  //   if (dependent) getEvents();
  // }, [dependent]);

  return (
    <div>
      <div className="flex space-x-2 overflow-x-auto">
        {events?.map((event: any) => (
          <div
            key={event.id}
            className="my-3 flex rounded-lg border border-gray-200"
          >
            <div className="flex w-64 flex-col justify-between rounded-r-lg bg-gray-50 p-2">
              <div className="relative">
                <img
                  className="h-32 w-full w-full rounded-lg object-cover"
                  src={
                    event?.cover_image ||
                    "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"
                  }
                  alt={event?.name}
                />
                <div className="absolute left-2 top-2 rounded bg-gray-300 p-2 text-black">
                  <div className="flex flex-col items-center">
                    <span className="text-md font-bold">
                      {formatDay(event?.schedule?.start_date)}
                    </span>
                    <span className="text-xs">
                      {formatMonth(event?.schedule?.start_date)}
                    </span>
                  </div>
                </div>
              </div>
              <h2 className="mb-2 pr-5 pt-2 text-lg font-bold">{event.name}</h2>
              <span className="rounded-full bg-lime-100 text-lime-500">
                {event?.parent_id && (
                  <span className="text-xs">({event.parent_id?.name})</span>
                )}
              </span>
              <div className="mb-4 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">
                  {event?.location?.name || event?.location}
                </span>
              </div>

              {event?.schedule && (
                <div>
                  <span className="flex items-center space-x-2 text-xs">
                    <AlarmClock className="mr-2 h-4 w-4" />
                    {event?.schedule?.start_time
                      ? formatStartTime(event.schedule.start_time)
                      : event?.schedule?.sessions?.[0]
                        ? formatStartTime(
                          event.schedule.sessions[0].start_time ||
                          event.schedule.sessions[0]["start-time"],
                        )
                        : ""}
                  </span>
                </div>
              )}

              {event?.rsvp?.find(
                (rs: any) =>
                  rs.person_id === dependent.to.id && rs.status === "paid",
              ) ? (
                <Link
                  href={`/portal/events/${event.id}/rsvp?dependent=${dependent.to.id}`}
                  className=" self-end rounded border bg-white px-3 py-2 font-bold"
                >
                  <div className="flex justify-between">
                    <CheckCircle className="mr-2 h-5 w-5" color="green" />
                    <span>Going</span>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/portal/events/${event.id}/rsvp?dependent=${dependent.to.id}`}
                  className="w-24 self-end rounded bg-black px-6 py-2 font-bold text-white"
                >
                  RSVP
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
