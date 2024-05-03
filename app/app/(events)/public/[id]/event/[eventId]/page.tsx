"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatStartTime,
  formatDate,
  formatTimeRange,
  formatDay,
  formatMonth,
} from "@/lib/utils";
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
  ExternalLink,
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
    <div className="mx-auto max-w-4xl px-5 pb-[100px]">
      {event ? (
        <div className="relative mx-auto mt-10">
          <div className="mb-2 flex items-center justify-between">
            <Link href="/portal">
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4" /> Back
              </span>
            </Link>
          </div>
          <div className="relative h-56 w-full md:h-[500px]">
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
                    <div className="flex inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-2">
                      <Users className="mr-2 h-3 w-3" />
                      <p>
                        <span className="text-sm text-gray-700">
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
                    <h1 className="mt-2 text-3xl font-bold md:text-4xl">{`${event?.name}`}</h1>
                    <div className="mt-5 grid grid-cols-2 divide-x divide-gray-300 rounded border border-gray-300 p-3">
                      <div className="col-span-1 flex items-center justify-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="text-black-700 text-lg">
                          {event?.location?.name || event?.location}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center justify-center ">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span className="text-lg">
                            <div className="flex items-center">
                              <div>
                                <span className="mr-1 text-lg">
                                  {formatMonth(event?.schedule?.start_date)}
                                </span>
                                <span className="text-lg">
                                  {formatDay(event?.schedule?.start_date)}
                                </span>
                              </div>
                              {event?.schedule?.end_date && (
                                <div>
                                  -
                                  <span className="mr-1 text-lg">
                                    {formatMonth(event?.schedule?.end_date)}
                                  </span>
                                  <span className="text-lg">
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
                  <div className="fixed inset-x-0 bottom-0 w-full border-t border-gray-300 bg-white px-3 py-5 md:relative md:border-0 md:px-0">
                    <Link
                      href={`/login?account_id=${params.id}&sign_up=true&from_events=true`}
                      className="flex w-full items-center justify-center rounded border-2 border-black bg-black px-2 py-3 text-white hover:bg-black hover:text-white"
                    >
                      <span className="mr-2 font-bold uppercase">
                        Register - ${event.fees?.amount}
                      </span>
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                    <div className="mt-2 flex justify-center">
                      <span className="text-[10px]">
                        You will be asked to sign in to or create an Athletes
                        App® account.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="my-5 text-lg font-light text-gray-700">
                {event?.description}
              </p>

              <div className="divide-y divide-gray-700 overflow-hidden rounded border border-gray-700">
                <h3 className="text-x p-3 font-bold">Schedule</h3>
                {event.events
                  .sort((a: any, b: any) => {
                    const aDateTime = new Date(
                      formatDate(a.schedule.start_date, a.schedule.start_time),
                    );
                    const bDateTime = new Date(
                      formatDate(b.schedule.start_date, b.schedule.start_time),
                    );
                    return aDateTime.getTime() - bDateTime.getTime();
                  })
                  .map((subEvent: any) => (
                    <div key={subEvent.id} className="flex items-center">
                      <div className="flex flex-col items-center justify-center border-r border-gray-700 bg-lime-300 p-5">
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
                              {formatTimeRange(
                                subEvent.schedule.start_date,
                                subEvent.schedule.start_time,
                                subEvent.schedule.end_date,
                                subEvent.schedule?.end_time,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
