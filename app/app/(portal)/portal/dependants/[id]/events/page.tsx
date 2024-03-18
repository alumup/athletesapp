"use client";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Calendar,
  CheckCircle,
  HelpCircle,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const TeamEvents = ({ params }: { params: { id: string } }) => {
  const [events, setEvents] = useState<any>([]);
  const [modalUpdate, setModalUpdate] = useState<any>(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*,accounts(*), fees(*), rsvp(*)")
        .eq("account_id", "0b2390b7-8da9-44c8-b55e-38d5a29115f2");

      if (!error && data) setEvents(data);

      setModalUpdate(false);
    };

    getEvents();
  }, [modalUpdate]);

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 py-10 shadow">
        <div className="flex items-center justify-between">
          <Link
            href={`/portal`}
            className="cursor rounded px-6 hover:bg-gray-100"
          >
            <span className="flex items-center space-x-2 text-sm text-gray-700">
              <ArrowLeftIcon className="h-8 w-8" />
            </span>
          </Link>
          <div className="cursor-pointer rounded px-6">
            <h1 className="mb-2 text-3xl">{events?.[0]?.accounts.name}</h1>
          </div>
          <div className="cursor-pointer rounded px-6"></div>
        </div>
        <div>
          <div className="bg-white p-6  md:mx-auto">
            <ul role="list" className="divide-y divide-gray-100">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    {events?.map((event: any) => (
                      <div key={event.id}>
                        <div className="group relative overflow-hidden  rounded-t-xl border p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="w-fit transform transition-all duration-500">
                              <h1 className="mb-2 text-3xl text-gray-900">
                                {event.name}
                              </h1>
                              <div className="flex">
                                <MapPin className="mr-2 h-5 w-5" />
                                <p className="font-normal text-gray-900">
                                  {event?.location?.name}
                                </p>
                              </div>
                              <div className="flex">
                                <Calendar className="mr-2 h-5 w-5" />

                                <p className="font-normal text-gray-900">
                                  {event?.schedule?.start_date
                                    ? new Date(
                                        event?.schedule?.start_date,
                                      ).toDateString()
                                    : ""}
                                </p>
                              </div>
                              <div className="flex">
                                <Users className="mr-2 h-5 w-5" />
                                <p className="font-normal text-gray-900">
                                  {event?.accounts?.name}
                                </p>
                              </div>
                            </div>
                            <div className="w-fit transform transition-all duration-500">
                              <div className="flex">
                                <CheckCircle
                                  color="green"
                                  className="mr-2 h-5 w-5"
                                />
                                <p className="font-normal text-gray-900">
                                  {
                                    event?.rsvp.filter(
                                      (rsv: any) => rsv.status === "paid",
                                    ).length
                                  }{" "}
                                  Going
                                </p>
                              </div>
                              <div className="flex">
                                <XCircle color="red" className="mr-2 h-5 w-5" />

                                <p className="font-normal text-gray-900">
                                  0 Not Going
                                </p>
                              </div>
                              <div className="flex">
                                <HelpCircle className="mr-2 h-5 w-5" />
                                <p className="font-normal text-gray-900">
                                  {
                                    event?.rsvp.filter(
                                      (rsv: any) => rsv.status === "undecided",
                                    ).length
                                  }{" "}
                                  Maybe
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!event.rsvp.find(
                          (rsv: any) =>
                            rsv.person_id === params.id &&
                            rsv.status === "paid",
                        ) ? (
                          <Link
                            href={`/portal/dependants/${params.id}/events/${event.id}`}
                            className="mb-5 flex h-8 w-full items-center justify-center rounded-b-lg border bg-sky-200 p-5 text-sm font-medium ring-offset-white"
                          >
                            <Calendar className="h-5 w-5" />
                            <span className="text-md">Tap To RSVP</span>
                          </Link>
                        ) : (
                          <div className="mb-5 flex h-8 w-full items-center justify-center rounded-b-lg border bg-green-500 p-5 text-sm font-medium ring-offset-white">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-md">You're Going</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamEvents;
