"use client";
import Image from "next/image";
import { formatStartTime, formatDate, formatTimeRange, formatDay, formatMonth } from "@/lib/utils";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModalMultipleParticipants from "@/components/modal/create-payment-modal-multiple-participants";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Loader,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const EventRSVP = ({ params }: { params: { id: string } }) => {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  const { refresh } = useRouter();
  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [dependant, setDependant] = useState<any>();
  const [event, setEvents] = useState<any>();
  const [selectedDependants, setSelectedDependants] = useState<any>([]);
  const [isGoing, setIsGoing] = useState<any>(false);
  const [isParentPaid, setIsParentPaid] = useState<any>(false);

  const currentDependent = searchParams.get("dependent");
  const [isSession, setIsSession] = useState<boolean>(false);
  const [parentEvent, setParentEvent] = useState<any>();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error) setUser(user);
    };

    getUser();

    const getEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*,accounts(*), fees(*), rsvp(*, people(*)), parent_id(*), events(*)")
        .eq("id", params.id)
        .single();
      console.log(data);
      if (!error && data) {
        setEvents(data);
        // setParentEvent(data.parent_id?.id)
        setIsSession(data.events);
      }
      if (currentDependent) {
        const going = data?.rsvp?.find(
          (rs: any) => rs.person_id === currentDependent,
        );
        // setDependant(going?.people);
        if (going && going.status === "paid") {
          setIsGoing(true);
        }
      }

      console.log("EVENT", data)

      if (data.parent_id) {
        setIsSession(true);
        const { data: parentData, error } = await supabase
          .from("events")
          .select("*,accounts(*), fees(*), rsvp(*)")
          .eq("id", data.parent_id.id)
          .single();

        if (!error) {
          setParentEvent(parentData);
          const parentRsvp = parentData.rsvp.find(
            (rs: any) => rs.person_id === currentDependent,
          );
          console.log(parentRsvp, "parent rsvp");
          if (parentRsvp && parentRsvp.status === "paid") {
            setIsParentPaid(true);
          }
        } else console.log("-- Error getting parent event ---");
      }
    };

    getEvents();

    const getDependentDetails = async () => {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("id", currentDependent)
        .single();

      if (data) setDependant(data);
      else console.log("----error getting dependent data ----", error);
    };

    getDependentDetails();
  }, []);

  useEffect(() => {
    if (user) {
      const getDependents = async () => {
        if (searchParams && currentDependent) {
          if (!selectedDependants.includes(currentDependent)) {
            // create participants entry

            const { data: dependentRsvp, error: dependentRsvpError } =
              await supabase
                .from("rsvp")
                .select("*")
                .eq("events_id", event?.id || params.id)
                .eq("person_id", currentDependent)
                .eq("profile_id", user.id)
                .single();

            if (dependentRsvpError) {
              console.error(
                "Error fetching RSVP records:",
                dependentRsvpError.message,
              );
            }

            if (!dependentRsvp) {
              const { data, error } = await supabase
                .from("rsvp")
                .insert({
                  status: "undecided",
                  events_id: event?.id || params.id,
                  person_id: currentDependent,
                  profile_id: user.id,
                  payments_id: null,
                })
                .select("*, people(*), profiles(*)")
                .single();
            }

            setSelectedDependants([currentDependent]);
          }
        }
      };
      getDependents();

      const getProfile = async () => {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*, accounts(*), people(*)")
          .eq("id", user?.id)
          .single();

        if (profileError) console.log("---- GET profile Error", profileError);
        else setProfile(profile);
      };
      getProfile();
    }
  }, [user]);

  const updateRSVP = async () => {
    const { data, error } = await supabase
      .from("rsvp")
      .update({
        status: "paid",
      })
      .in("person_id", selectedDependants)
      .eq("events_id", event.id)
      .select();

    if (error) toast("Unable to RSVP.");
    else {
      toast("RSVP done.");
      setIsGoing(true);
      refresh();
    }
  };

  return (
    <div className="px-5 mb-20">
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
                  <h1 className="text-2xl font-bold">{`${event?.name}`}</h1>
                </div>

                {!isSession ? (
                  !isGoing ? (
                    <div className="fixed bottom-0 inset-x-0 w-full">
                      {event?.fees?.type !== "free" ? (
                        <GenericButton
                          size="lg"
                          variant="default"
                          classNames={'w-full'}
                          cta={`${dependant
                            ? `Pay for ${dependant?.first_name}`
                            : "Pay"
                            } $${(event?.fees?.amount).toFixed(2)}`}
                        >
                          <CreatePaymentModalMultipleParticipants
                            account={event?.accounts}
                            profile={profile}
                            persons={selectedDependants}
                            fee={event?.fees}
                            event={event}
                          />
                        </GenericButton>
                      ) : (
                        <button
                          onClick={updateRSVP}
                          className="flex rounded-full border-2 border-black bg-black p-2 px-4 text-white hover:bg-black hover:text-white"
                        >
                          {/* <CheckCircle className='h-5 w-5 mr-3' /> */}
                          <span>{`${dependant
                            ? `Register for ${dependant?.first_name}`
                            : "Register"
                            }`}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button className="flex rounded border p-2 px-4">
                        <CheckCircle className="mr-3 h-5 w-5" color="green" />
                        <span className="">Going</span>
                      </button>
                    </div>
                  )
                ) : isParentPaid ? (
                  isGoing ? (
                    <>
                      <div className="flex justify-end">
                        <button className="flex rounded border p-2 px-4">
                          <CheckCircle className="mr-3 h-5 w-5" color="green" />
                          <span className="">Going</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="fixed bottom-0 inset-x-0 flex justify-end">
                      <button
                        onClick={updateRSVP}
                        className="flex rounded-full border-2 border-black bg-black p-2 px-4 text-white hover:bg-black hover:text-white "
                      >
                        <span>{`${dependant
                          ? `Register for ${dependant?.first_name}`
                          : "Register"
                          }`}</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="col-span-1 mt-5 flex items-center justify-end">
                    <Link
                      href={`/portal/events/${parentEvent?.id}/rsvp?dependent=${currentDependent}`}
                      className="rounded-full border-2 border-black p-2 px-4 text-black hover:bg-black hover:text-white"
                    >
                      Pay to Enroll
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 divide divide-x-2 divide-gray-700">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="text-black-700 text-lg">
                    {event?.location?.name || event?.location}
                  </span>
                </div>
                <div className="pl-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
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
                          {formatDay(event?.schedule?.start_date)}
                        </span>
                        <span className="text-sm">
                          {formatMonth(event?.schedule?.start_date)}
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

export default EventRSVP;
