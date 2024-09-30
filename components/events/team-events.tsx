"use client";
import Image from "next/image";
import {
  formatStartTime,
  formatDay,
  formatMonth,
  formatDate,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase/client"
import {
  AlarmClock,
  CheckCircle,
  MapPin,
  Group,
  Clock,
  CalendarRange,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Event from "./event";

export default function TeamEvents({ dependent, rosters }: any) {
  const supabase = createClient();
  const [events, setEvents] = useState<any>([]);
  const [filteredEvents, setFilteredEvents] = useState<any>([]);

  const personId = dependent?.to?.id || dependent?.id;
  const person = dependent?.to || dependent;

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
    console.log("ROSTIES", rosters);
    const fetchEventsForTeams = async (teams: any) => {
      const teamIds: any = [];
      teams.forEach((team: any) => teamIds.push(team.id));
      const res = await supabase
        .from("events")
        .select(
          "*, teams(*), accounts(*), fees(*), rsvp(*), parent_id(*, rsvp(*)), events(*, teams(*), rsvp(*))",
        )
        .gte("date", new Date().toLocaleString("en-US", { timeZone: "America/Denver" }))
        .in("team_id", teamIds)
        .order("date", { ascending: true });

      return res.data || [];
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

  useEffect(() => {
    const sortEvents = async () => {
      const newEvents = [];
      const parentEvents = events?.filter((event: any) => !event.parent_id);

      newEvents.push(...parentEvents);

      // Uncomment if all (parent + subevents) needs to be visible
      // parentEvents.forEach((parentEvent: any) => {
      //   if (
      //     parentEvent?.events &&
      //     parentEvent.rsvp.some(
      //       (rs: any) => rs.person_id === personId && rs.status === "paid",
      //     )
      //   ) {
      //     newEvents.push(...parentEvent.events);
      //   }
      // });

      console.log("ALL EVENTS", newEvents);

      setFilteredEvents(newEvents);
    };

    sortEvents();
  }, [events]);

  return (
    <div className={`h-full transition-all ${isVisible ? "" : "blur-lg"}`}>
      <div className="flex space-x-2 overflow-x-auto">
        {filteredEvents
          .sort((a: any, b: any) => {
            // Ensure both date and time are properly combined and parsed
            const aDateTime = new Date(
              `${a.schedule.start_date}T${a.schedule.start_time || "00:00"}`,
            );
            const bDateTime = new Date(
              `${b.schedule.start_date}T${b.schedule.start_time || "00:00"}`,
            );
            return aDateTime.getTime() - bDateTime.getTime();
          })
          .map((event: any) => {
            if (new Date(`${event.schedule.end_date}T${event.schedule.end_time || "00:00"}`) > new Date())
              return (
                <>
                  <div
                    key={event?.id}
                    className="my-3 flex rounded-lg border border-gray-200"
                  >
                    <div className="flex w-64 flex-col justify-between rounded-r-lg bg-white p-2">
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
                        <div className="absolute left-2 top-2 rounded border border-black bg-lime-300 p-2 text-black">
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
                      <div className="mt-2 inline-flex">
                        <span className="rounded-full border border-lime-300 bg-lime-100 px-2 py-0.5 text-[10px] text-lime-900">
                          {" "}
                          {event?.teams?.name}
                        </span>
                      </div>
                      <h2 className="text-md mb-1 font-bold">{event?.name}</h2>

                      <div className="mb-2 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {event?.location?.name || event?.location}
                        </span>
                      </div>

                      {!event?.parent_id && (
                        <div className="mb-2 flex items-center space-x-2">
                          <CalendarRange className="h-4 w-4" />
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
                      )}

                      {event?.schedule && event?.schedule?.start_time && (
                        <div>
                          <span className="flex items-center space-x-2 text-xs">
                            <AlarmClock className="mr-2 h-4 w-4" />
                            {event?.schedule?.start_time
                              ? formatStartTime(event.schedule.start_time)
                              : event?.schedule?.sessions?.[0]
                                ? formatStartTime(
                                  event.schedule.sessions[0].start_time,
                                )
                                : ""}
                          </span>
                        </div>
                      )}

                      {event?.rsvp?.find(
                        (rs: any) =>
                          rs.person_id === personId && rs.status === "paid",
                      ) ? (
                        <Link
                          href={`/portal/events/${event.id}/rsvp?dependent=${personId}`}
                          className=" self-end rounded border bg-white px-3 py-2 font-bold"
                        >
                          <div className="flex justify-between text-xs">
                            <CheckCircle className="mr-2 h-4 w-4" color="green" />
                            <span>Going</span>
                          </div>
                        </Link>
                      ) : (
                        <Link
                          href={`/portal/events/${event?.id}/rsvp?dependent=${personId}`}
                          className="self-end rounded bg-black px-6 py-2 text-xs font-bold text-white"
                        >
                          RSVP
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* If you want to show subevents immediately after main event. */}
                  {/* {event?.events &&
                event.rsvp.some(
                  (rs: any) =>
                    rs.person_id === personId && rs.status === "paid",
                ) &&
                event.events
                  .sort((a: any, b: any) => {
                    const aDateTime = new Date(
                      formatDate(a.schedule.start_date, a.schedule.start_time),
                    );
                    const bDateTime = new Date(
                      formatDate(b.schedule.start_date, b.schedule.start_time),
                    );
                    return aDateTime.getTime() - bDateTime.getTime();
                  })
                  .map((se: any, index: any) => (
                    <div
                      key={index}
                      className="my-3 flex rounded-lg border border-gray-200"
                    >
                      <Event event={se} person={person} />
                    </div>
                  ))} */}
                </>
              )
          })}
      </div>
    </div>
  );
}
