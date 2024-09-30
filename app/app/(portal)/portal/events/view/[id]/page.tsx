"use client";
import GenericButton from "@/components/modal-buttons/generic-button";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase/client"
import Link from "next/link";
import React, { useEffect, useState } from "react";

const EventDetails = ({ params }: { params: { id: string } }) => {
  const [events, setEvents] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const getEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*,accounts(*)")
        .eq("id", params.id);

      if (!error && data) setEvents(data);

      console.log(data, "< data\n\n");
    };

    getEvents();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 pb-5 pt-10 shadow">
        <div className="flex items-center justify-between">
          <Link
            href={`/portal`}
            className="cursor rounded px-6 hover:bg-gray-100"
          >
            <span className="flex items-center space-x-2 text-sm text-gray-700">
              <ArrowLeftIcon className="h-8 w-8" />
            </span>
          </Link>
        </div>
        <div>
          <div className="bg-white px-4 md:mx-auto">
            <div className="">
              <div className="p-6">
                <h1 className="mb-8 text-center text-4xl font-bold">
                  {`${events[0]?.name}`}
                  <span className="text-xl font-medium text-gray-800">{` (${events[0]?.accounts?.name})`}</span>
                </h1>
                <p className="mb-5 text-gray-800">{events[0]?.description}</p>
                <div className="flex justify-between">
                  <img
                    className="mb-4 h-24 w-24"
                    src={events[0]?.accounts.logo}
                    alt={events[0]?.accounts.name}
                  />
                  <div>
                    <p className="mb-2">
                      <strong>Location:</strong>{" "}
                      <span className="text-gray-700">
                        {events[0]?.location.name}
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong>Start Date:</strong>
                      <span className="text-gray-700">
                        {" "}
                        {events[0]?.schedule.start_date}
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong>End Date:</strong>
                      <span className="text-gray-700">
                        {" "}
                        {events[0]?.schedule.end_date}
                      </span>
                    </p>
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold">Sessions</h2>
                <div className="flex">
                  {events[0]?.schedule.sessions.map(
                    (session: any, index: any) => (
                      <div key={index} className="mx-2 mb-2 rounded border p-3">
                        <p>
                          <strong>Date:</strong>{" "}
                          <span className="text-gray-700">{session.date}</span>
                        </p>
                        <p>
                          <strong>Group:</strong>
                          <span className="text-gray-700">
                            {" "}
                            {session.group}
                          </span>
                        </p>
                        <p>
                          <strong>Start Time:</strong>
                          <span className="text-gray-700">
                            {" "}
                            {session.start_time}
                          </span>
                        </p>
                        <p>
                          <strong>End Time:</strong>
                          <span className="text-gray-700">
                            {" "}
                            {session.end_time}
                          </span>
                        </p>
                      </div>
                    ),
                  )}
                </div>
                <div className="col-span-1 mt-5 flex items-center justify-end">
                  <Link
                    href={`/portal/events/${params.id}/rsvp`}
                    className="rounded bg-black p-2 text-white hover:bg-gray-800"
                  >
                    RSVP
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
