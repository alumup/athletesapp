"use client";

import { formatDate, formatTimeRange } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AlarmClock, CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountPublicEvents({
  account,
  profile,
  selectedDependent,
}: any) {
  const supabase = createClientComponentClient();
  const [events, setEvents] = useState<any>([]);

  useEffect(() => {
    const getEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*,accounts(*), fees(*), rsvp(*), parent_id(*)")
        .gte("date", new Date().toISOString())
        .eq("account_id", account?.id)
        // .eq("visibility", "public")
        // .is("parent_id", null)
        .order("date", { ascending: true });

      if (error) console.log("ERROR getting events: ", error);
      else {
        setEvents(data);
        console.log(data, "--- events data --- public-events.tsx");
      }
    };

    getEvents();
  }, [account, selectedDependent]);

  return (
    <div>
      <div className="flex justify-between space-x-2 overflow-x-auto">
        {events?.map((event: any) => (
          <div
            key={event.id}
            className="flex h-64 rounded-lg border border-lime-200"
          >
            <div className="flex min-w-[100px] items-center justify-center bg-lime-200 p-4">
              <div className="mb-2 text-center">
                <span className="text-bold">
                  {formatDate(event?.schedule?.start_date)}
                </span>
              </div>
            </div>

            <div className="flex w-64 flex-col justify-between rounded-r-lg bg-lime-50 p-4">
              <h2 className="mb-2 pr-5 pt-5 text-lg font-bold">
                {event.name}{" "}
                {event?.parent_id && (
                  <span className="text-sm">({event.parent_id?.name})</span>
                )}
              </h2>

              {event?.schedule && (
                <div className="flex items-center space-x-2">
                  <AlarmClock className="h-5 w-5" />
                  <span className="mr-2">
                    {formatTimeRange(
                      event?.schedule?.start_time || event?.schedule?.sessions?.[0]?.start_time || event?.schedule?.sessions?.[0]["start-time"] || "",
                      event?.schedule?.end_time || event?.schedule?.sessions?.[0]?.end_time || event?.schedule?.sessions?.[0]["end-time"] || "",
                    )}
                  </span>
                </div>
              )}
              <div className="mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{event?.location?.name || event?.location}</span>
              </div>

              {event?.rsvp?.find(
                (rs: any) =>
                  rs.person_id ===
                  (selectedDependent?.to?.id || profile?.people?.id) &&
                  rs.status === "paid",
              ) ? (
                <Link
                  href={`/portal/events/${event.id}/rsvp?dependent=${selectedDependent?.to?.id || profile?.people?.id
                    }`}
                  className=" self-end rounded border bg-white px-3 py-2 font-bold"
                >
                  <div className="flex justify-between">
                    <CheckCircle className="mr-2 h-5 w-5" color="green" />
                    <span>Going</span>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/portal/events/${event.id}/rsvp?dependent=${selectedDependent?.to?.id || profile?.people?.id
                    }`}
                  className="w-24 self-end rounded bg-black px-6 py-2 font-bold text-white"
                >
                  RSVP
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="my-2">
        <Link
          href={`/portal/events/${profile?.accounts?.id}`}
          className="text-xs text-gray-600"
        >
          See All Events
        </Link>
      </div>
    </div>
  );
}
