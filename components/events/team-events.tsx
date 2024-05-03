"use client";
import Image from "next/image";
import { formatStartTime, formatDay, formatMonth } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  AlarmClock,
  CheckCircle,
  MapPin,
  Group,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TeamEvents({ dependent, rosters, profile }: any) {
  const supabase = createClientComponentClient();
  const [events, setEvents] = useState<any>([]);
  const [isDataLoaded, setDataLoaded] = useState(false);

  const personId = dependent?.to?.id || dependent?.id;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (rosters && rosters.length > 0) {
      // Delay the visibility to allow for CSS transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100); // Adjust delay as needed
      return () => clearTimeout(timer);
    }
  }, [rosters]);

  useEffect(() => {
    const fetchEventsForTeams = async (teams: any) => {
      const promises = teams.map((team: any) =>
        supabase
          .from("events")
          .select("*,accounts(*), fees(*), rsvp(*), parent_id(*, rsvp(*))")
          .gte("date", new Date().toISOString())
          .eq("team_id", team.id)
          .order("date", { ascending: true }),
      );

      const results = await Promise.all(promises);
      return results.reduce((acc, current) => acc.concat(current.data), []);
    };

    const getEvents = async () => {
      if (rosters && rosters.length > 0) {
        const teams = rosters.map((roster: { teams: any }) => roster.teams);
        const allEvents = await fetchEventsForTeams(teams.flat());
        setEvents(allEvents);
      }
    };

    if (dependent) {
      getEvents();
    }
  }, [dependent, rosters]);

  return (
    <div className={`transition-all ${isVisible ? "" : "blur-lg"}`}>
      <div className="flex space-x-2 overflow-x-auto">
        {events?.map((event: any) => (
          <div
            key={event.id}
            className="my-3 flex rounded-lg border border-gray-200"
          >
            <div className="flex w-64 flex-col justify-between rounded-r-lg bg-gray-50 p-2">
              <div className="relative h-32 w-full rounded-lg">
                <Image
                  className=" object-cover"
                  src={
                    event?.cover_image ||
                    "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"
                  }
                  fill
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
                {event?.parent_id && (
                  <div className="absolute right-2 top-2 rounded bg-gray-300 p-2 text-black">
                    <Group className="h-4 w-4" />
                  </div>
                )}
              </div>
              <h2 className="text-md mb-2 pt-2 font-bold">{event.name}</h2>

              <div className="mb-2 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {event?.location?.name || event?.location}
                </span>
              </div>

              <div className="mb-2 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  <div className="flex items-center">
                    <div>
                      <span className="mr-1 text-xs">
                        {formatMonth(event?.schedule?.start_date)}
                      </span>
                      <span className="text-xs">
                        {formatDay(event?.schedule?.start_date)}
                      </span>
                    </div>
                    {event?.schedule?.end_date && (
                      <div>
                        -
                        <span className="mr-1 text-xs">
                          {formatMonth(event?.schedule?.end_date)}
                        </span>
                        <span className="text-xs">
                          {formatDay(event?.schedule?.end_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </span>
              </div>

              {event?.schedule?.start_time && (
                <div className="mb-2 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">
                    <div className="flex items-center">
                      <div>
                        <span className="mr-1 text-xs">
                          {event?.schedule?.start_time}
                        </span>
                      </div>
                    </div>
                  </span>
                </div>
              )}

              {event?.schedule && event?.schedule?.start_time && (
                <div>
                  <span className="flex items-center space-x-2 text-xs">
                    <AlarmClock className="mr-2 h-4 w-4" />
                    {event?.schedule?.start_time
                      ? formatStartTime(event.schedule.start_time)
                      : event?.schedule?.sessions?.[0]
                      ? formatStartTime(event.schedule.sessions[0].start_time)
                      : ""}
                  </span>
                </div>
              )}

              {event?.rsvp?.find(
                (rs: any) => rs.person_id === personId && rs.status === "paid",
              ) ? (
                <Link
                  href={`/portal/events/${event.id}/rsvp?dependent=${personId}`}
                  className=" self-end rounded border bg-white px-3 py-2 font-bold"
                >
                  <div className="flex justify-between">
                    <CheckCircle className="mr-2 h-5 w-5" color="green" />
                    <span>Going</span>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/portal/events/${event.id}/rsvp?dependent=${personId}`}
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
