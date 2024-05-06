"use client";
import Image from "next/image";
import { formatStartTime, formatDay, formatMonth } from "@/lib/utils";

import {
  AlarmClock,
  CheckCircle,
  MapPin,
  Group,
  Calendar,
  Clock,
  CalendarRange,
} from "lucide-react";
import Link from "next/link";

export default function Event({ event, person }: { event: any; person: any }) {
  return (
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
      <h2 className="text-md mb-1 font-bold">{event.name}</h2>

      <div className="mb-2 flex items-center space-x-2">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">
          {event?.location?.name || event?.location}
        </span>
      </div>

      {event?.schedule && event?.schedule?.start_time && (
        <div>
          <span className="flex items-center space-x-2 text-xs">
            <AlarmClock className="mr-2 h-4 w-4" />
            {formatStartTime(event.schedule.start_time)}
          </span>
        </div>
      )}

      {event?.rsvp?.find(
        (rs: any) => rs.person_id === person?.id && rs.status === "paid",
      ) ? (
        <Link
          href={`/portal/events/${event.id}/rsvp?dependent=${person?.id}`}
          className="self-end rounded border bg-white px-3 py-2 text-xs font-bold"
        >
          <div className="flex justify-between">
            <CheckCircle className="mr-2 h-5 w-5" color="green" />
            <span>Going</span>
          </div>
        </Link>
      ) : (
        <Link
          href={`/portal/events/${event.id}/rsvp?dependent=${person?.id}`}
          className="self-end rounded bg-black px-6 py-2 text-xs font-bold text-white"
        >
          RSVP
        </Link>
      )}
    </div>
  );
}
