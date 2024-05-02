"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ArrowLeftCircleIcon,
  Calendar,
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
  const [schedule, setSchedule] = useState<any>([]);

  useEffect(() => {
    const getAccountEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, accounts(*), fees(*)")
        .eq("visibility", "public")
        .eq("account_id", params.id)
        .eq("id", params.eventId)
        .single();

      if (error) toast("Error fetching events.");
      else setEvent(data);
    };

    getAccountEvents();
  }, []);

  useEffect(() => {
    const getSchedules = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("parent_id", event?.id || params.eventId);

      if (error) {
        console.log("----- Error getting schedules -----", error);
        toast("Something went wrong!");
        setSchedule([event]);
        return;
      }
      setSchedule(data);
    };

    getSchedules();
  }, [event]);
  return (
    <div className="px-5">
      {event ? (
        <div className="relative mx-auto mt-10">
          <div className="mb-2 flex items-center justify-between">
            <Link href="/portal">
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4" /> Back
              </span>
            </Link>
          </div>
          <div className="relative w-full h-56">
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
                <div>
                  <h2>
                    {event?.parent_id && (
                      <span className="text-xl font-medium text-gray-600">{` (${event?.parent_id?.name})`}</span>
                    )}
                  </h2>
                  <h1 className="text-2xl font-bold">{`${event?.name}`}</h1>
                </div>

                <div className="fixed bottom-0 inset-x-0 flex justify-end">
                  <button
                   
                    className="flex rounded-full border-2 border-black bg-black p-2 px-4 text-white hover:bg-black hover:text-white "
                  >
                    <span>Register</span>
                  </button>
                </div>
              </div>
              <p className="mb-5 text-lg text-gray-800">{event?.description}</p>
              <div className="flex justify-between">
                <div>
                  <div className="flex">
                    <MapPin className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-black-700 text-lg">
                        {event?.location?.name || event?.location}
                      </span>
                    </p>
                  </div>
                  <div className="flex">
                    <Calendar className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-black-700 text-lg">
                        {" "}
                        {new Date(event?.schedule?.start_date).toDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex">
                    <Users className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-black-700 text-lg">
                        {" "}
                        {event?.accounts?.name}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* This section needs refactoring */}
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center">
          <Loader className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default PublicAccountEventsDetail;



