"use client";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Calendar,
  CheckCircle,
  Cross,
  FileQuestion,
  HelpCircle,
  MapPin,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const EventDetails = ({
  params,
}: {
  params: { eventId: string; id: string };
}) => {
  const [events, setEvents] = useState<any>(null);
  const [user, setUser] = useState<any>();
  const [rsvp, setRsvp] = useState<any>();
  const [account, setAccount] = useState<any>();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.log("Error fetching user: ", error.message);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*, senders(*)), people(*)")
        .eq("id", user?.id)
        .single();

      console.log(profile, "<< profile");

      if (profileError)
        console.log("Error fetching profile: ", profileError.message);

      setUser(profile);
      setAccount(profile.accounts);
    };

    getUser();
  }, []);

  useEffect(() => {
    const getEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*,accounts(*), fees(*)")
        .eq("id", params.eventId)
        .single();

      if (!error && data) setEvents(data);
    };

    getEvents();
  }, [user]);

  useEffect(() => {
    console.log(events, user, "--- outside");
    if (events && user) {
      console.log(events, user, "---canjt her");
      // create RSVP
      const createRSVP = async () => {
        console.log("trying it, trying it");
        const { data: rsvpData, error: rsvpError } = await supabase
          .from("rsvp")
          .select("*, people(*), profiles(*)")
          .eq("events_id", events.id)
          .eq("person_id", params.id)
          .eq("profile_id", user.id)
          .single();

        if (rsvpData) {
          setRsvp(rsvpData);
        } else {
          const { data, error } = await supabase
            .from("rsvp")
            .insert({
              status: "undecided",
              events_id: events.id,
              person_id: params.id,
              profile_id: user.id,
              payments_id: null,
            })
            .select("*, people(*), profiles(*)")
            .single();

          if (!error) setRsvp(data);

          console.log("RSVP created ----- ", data);
        }
      };

      createRSVP();
    }
  }, [events]);

  const updateRSVP = async () => {
    const { error } = await supabase
      .from("rsvp")
      .update({
        status: "going",
      })
      .eq("id", rsvp.id);
    if (error) toast("Error on RSVP!");
  };

  console.log(rsvp, "<---------- rsvp");
  return (
    <>
      {events && (
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 pb-5 pt-10 shadow">
          <div className="flex items-center justify-between">
            <Link
              href={`/portal/dependants/${params.id}/events`}
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
                  <h1 className="mb-8 text-center text-3xl text-4xl font-normal">
                    {`${events?.name}`}
                    <span className="text-xl font-medium text-gray-800">{` (${events?.accounts?.name})`}</span>
                  </h1>
                  <p className="mb-5 text-lg text-gray-800">
                    {events?.description}
                  </p>
                  <div>
                    <div className="flex">
                      <MapPin className="mr-3 h-5 w-5" />
                      <p className="mb-2">
                        <span className="text-lg text-gray-700">
                          {events?.location.name}
                        </span>
                      </p>
                    </div>
                    <div className="flex">
                      <Calendar className="mr-3 h-5 w-5" />
                      <p className="mb-2">
                        <span className="text-lg text-gray-700">
                          {" "}
                          {events?.schedule.start_date}
                        </span>
                      </p>
                    </div>
                    <div className="flex">
                      <Users className="mr-3 h-5 w-5" />
                      <p className="mb-2">
                        <span className="text-lg text-gray-700">
                          {" "}
                          {events?.accounts?.name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="my-5 flex justify-between">
                    <div className="flex">
                      <CheckCircle color="green" className="mr-3 h-5 w-5" />
                      Going
                    </div>
                    <div className="flex">
                      <XCircle color="red" className="mr-3 h-5 w-5" />
                      Not Going
                    </div>
                    <div className="flex">
                      <HelpCircle className="mr-3 h-5 w-5" />
                      Maybe
                    </div>
                  </div>

                  <div className="col-span-1 mt-5 flex items-center justify-end">
                    {rsvp && rsvp.status === "going" ? (
                      <button
                        disabled
                        className="flex rounded bg-green-700 p-2 px-4"
                      >
                        <CheckCircle className="mr-3 h-5 w-5" />
                        <span className="text-white">Yes Going</span>
                      </button>
                    ) : events?.fees?.type === "free" ? (
                      <button
                        onClick={updateRSVP}
                        className="flex rounded bg-black p-2 px-4"
                      >
                        <CheckCircle className="mr-3 h-5 w-5" />
                        <span className="text-white">RSVP</span>
                      </button>
                    ) : (
                      <GenericButton
                        size="sm"
                        variant="default"
                        classNames=""
                        cta={`Pay $${events?.fees?.amount}`}
                      >
                        <CreatePaymentModal
                          account={account}
                          profile={user}
                          rsvp={rsvp}
                          fee={events?.fees}
                          person={rsvp?.people}
                        />
                      </GenericButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventDetails;
