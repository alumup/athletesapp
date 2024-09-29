"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PublicAccountEvents = ({ params }: { params: { id: string } }) => {
  const supabase = createClient();
  const [events, setEvents] = useState<any>([]);

  useEffect(() => {
    const getAccountEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, accounts(*)")
        .eq("visibility", "public")
        .eq("account_id", params.id)
        .is("parent_id", null);

      if (error) {
        console.log("Error fetching events: ", error);
        toast("Error fetching events.");
      } else setEvents(data);
    };

    getAccountEvents();
  }, []);
  return (
    <>
      {events &&
        events.map((event: any) => (
          <div
            key={Math.random()}
            className="mb-5 max-w-sm rounded-lg border border-gray-200 shadow dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-3">
              <img
                className="rounded"
                src={
                  event.cover_image ||
                  "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"
                }
                alt=""
              />
            </div>
            <div className="p-3 pt-0">
              <Badge variant="secondary">{event.accounts.name}</Badge>
              <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {event.name}
              </h5>
              <p className="mb-1 font-normal text-gray-700 dark:text-gray-400">
                {event.location.name}
              </p>
              <p className="mb-1 font-normal text-gray-700 dark:text-gray-400">
                {new Date(event.date).toDateString()}
              </p>
              <div className="flex justify-end">
                <Button asChild>
                  <Link href={`/public/${params.id}/event/${event.id}`}>
                    SEE EVENT
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default PublicAccountEvents;
