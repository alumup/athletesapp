"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatStartTime, formatDate, formatTimeRange, formatDay, formatMonth } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ArrowLeftCircleIcon,
  Calendar,
  Clock,
  CalendarIcon,
  CheckCircle,
  ChevronLeft,
  HelpCircle,
  Loader,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";

import { useSearchParams } from "next/navigation";

const PublicAccountEventsDetail = ({
  params,
}: {
  params: { id: string; eventId: string };
}) => {
  const supabase = createClientComponentClient();
  const [event, setEvent] = useState<any>();

  useEffect(() => {
    const getAccountEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, accounts(*), fees(*), events(*)")
        .eq("visibility", "public")
        .eq("account_id", params.id)
        .eq("id", params.eventId)
        .single();

      if (error) toast("Error fetching events.");
      else setEvent(data);
    };

    getAccountEvents();
  }, []);





  return (
    <div className="max-w-4xl mx-auto px-5 pb-[100px]">
      {event ? (
        <div className="relative mx-auto mt-10">
          <div className="mb-2 flex items-center justify-between">
            <Link href="/portal">
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4" /> Back
              </span>
            </Link>
          </div>
          <div className="relative w-full h-56 md:h-[500px]">
            <Image
              className="rounded object-cover"
              src={
                event?.cover_image ||
                "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"
              }
              fill
              alt=""
            />
          </div>
          <div
            style={{ height: "10%" }}
            className="bottom-0 left-0 right-0 rounded-t-lg bg-white md:mx-auto"
          >
            <div>
              <div className="mt-5">
                <div className="grid grid-cols-2 gap-10">
                  <div className="col-span-2 md:col-span-1">
                    <div className="flex inline-flex px-2 items-center rounded-full bg-gray-50 border border-gray-300">
                      <Users className="mr-2 h-3 w-3" />
                      <p>
                        <span className="text-gray-700 text-sm">
                          {" "}
                          {event?.accounts?.name}
                        </span>
                      </p>
                    </div>
                    <h2>
                      {event?.parent_id && (
                        <span className="text-xl font-medium text-gray-600">{` (${event?.parent_id?.name})`}</span>
                      )}
                    </h2>
                    <h1 className="text-3xl md:text-4xl font-bold">{`${event?.name}`}</h1>
                    <div className="mt-5 grid grid-cols-2 divide-x divide-gray-300 border border-gray-300 rounded p-3">
                      <div className="col-span-1 flex items-center justify-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="text-black-700 text-lg">
                          {event?.location?.name || event?.location}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center justify-center ">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-lg">
                            <div className="flex items-center">
                              <div>
                                <span className="text-lg mr-1">
                                  {formatMonth(event?.schedule?.start_date)}
                                </span>
                                <span
                                  className="text-lg">
                                  {formatDay(event?.schedule?.start_date)}
                                </span>
                              </div>
                              {event?.schedule?.end_date && (
                                <div>
                                  -
                                  <span className="text-lg mr-1">
                                    {formatMonth(event?.schedule?.end_date)}
                                  </span>
                                  <span
                                    className="text-lg">
                                    {formatDay(event?.schedule?.end_date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fixed md:relative bottom-0 inset-x-0 w-full px-3 md:px-0 py-5 border-t md:border-0 border-gray-300 bg-white">
                    <Link
                      href={`/login?account_id=${params.id}&sign_up=true&from_events=true`}
                      className="flex justify-center w-full rounded border-2 border-black bg-black py-3 px-2 text-white hover:bg-black hover:text-white"
                    >
                      <span className="uppercase font-bold">Register - ${event.fees?.amount}</span>
                    </Link>
                  </div>
                </div>
              </div>

              <p className="my-5 text-lg font-light text-gray-700">{event?.description}</p>

              <div className="border border-gray-700 divide-gray-700 divide-y rounded overflow-hidden">
                {/* Existing content */}
                {event.events
                  .sort((a: any, b: any) => {
                    const aDateTime = new Date(formatDate(a.schedule.start_date, a.schedule.start_time));
                    const bDateTime = new Date(formatDate(b.schedule.start_date, b.schedule.start_time));
                    return aDateTime.getTime() - bDateTime.getTime();
                  })
                  .map((subEvent: any) => (
                    <div key={subEvent.id} className="flex items-center">
                      <div className="p-5 bg-lime-300 border-r border-gray-700 flex flex-col justify-center items-center">
                        <span className="text-lg font-bold">
                          {formatDay(subEvent?.schedule?.start_date)}
                        </span>
                        <span className="text-sm">
                          {formatMonth(subEvent?.schedule?.start_date)}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold">{subEvent.name}</h4>

                        {event?.schedule?.start_time && (
                          <div className="mb-2 flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">

                              {formatTimeRange(subEvent.schedule.start_date, subEvent.schedule.start_time, subEvent.schedule.end_date, subEvent.schedule?.end_time)}

                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
                {/* More content */}
              </div>
              {/* This section needs refactoring */}
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center">
          <Loader className="h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PublicAccountEventsDetail;



