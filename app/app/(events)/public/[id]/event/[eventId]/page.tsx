"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    <>
      {event && (
        <div className="mb-5 rounded-lg border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="p-3">
            <img
              className="w-full rounded"
              src={
                event.cover_image ||
                "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"
              }
              alt=""
            />
          </div>
          <div className="mb-3 pt-0">
            <div className="mx-2 p-3">
              <Badge variant="secondary" className="mb-1">
                {event.accounts.name}
              </Badge>
              <h5 className="mb-2 text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
                {event.name}
              </h5>
              <p className="mb-1 font-normal text-gray-900 dark:text-gray-400">
                {event.location.name}
              </p>
              <p className="mb-1 font-normal text-gray-900 dark:text-gray-400">
                {new Date(event.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mb-1 text-sm font-light text-gray-700 dark:text-gray-400">
                {event.description}
              </p>
            </div>
            {schedule.length > 0 && (
              <div className="mx-2 px-3">
                <p className="mb-2 text-lg font-normal">Schedule</p>
                <div>
                  {schedule.map((scheduleItem: any) => (
                    <div key={scheduleItem.id + Math.random()} className="flex">
                      <div className="flex w-1/6 items-center rounded-l-lg border border-black bg-green-200 px-3 py-2 text-center font-medium">
                        {new Date(scheduleItem.date)
                          .toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })
                          .toUpperCase()}
                      </div>
                      <div className="w-5/6 rounded-r-lg border border-black px-3 py-2">
                        <div className="text-md font-medium">
                          {scheduleItem.name}
                        </div>
                        <div className="text-sm text-gray-800 ">
                          {scheduleItem.location?.name}
                        </div>
                        {/* <div className="text-sm">{scheduleItem.time}</div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Separator className="my-4" />
            <div className="mx-5 flex justify-center">
              <Button asChild className="w-full">
                <Link
                  href={`/login?account_id=${params.id}&sign_up=true&from_events=true`}
                >
                  {event?.fees && event?.fees?.type !== "free"
                    ? `$${event?.fees?.amount} - RSVP`
                    : "RSVP"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicAccountEventsDetail;
