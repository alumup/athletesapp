"use client";
import Image from "next/image";
import {
  formatStartTime,
  formatDate,
  formatTimeRange,
  formatDay,
  formatMonth,
} from "@/lib/utils";
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
  const [event, setEvent] = useState<any>();
  const [selectedDependants, setSelectedDependants] = useState<any>([]);
  const [isGoing, setIsGoing] = useState<any>(false);
  const [isParentPaid, setIsParentPaid] = useState<any>(false);

  const currentDependent = searchParams.get("dependent");
  const [isSession, setIsSession] = useState<boolean>(false);
  const [parentEvent, setParentEvent] = useState<any>();

  function getStatus(event: any, user: any) {
    if (!event || !user) return "Not Available";

    // Assuming `selectedDependants` is an array of dependant IDs
    const dependantRsvp = event.rsvp.find(
      (rsvp: any) => rsvp.person_id === user.id,
    );

    if (dependantRsvp) {
      return dependantRsvp.status; // 'paid', 'unpaid', 'undecided', etc.
    }

    return "Not Registered";
  }

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
        .select(
          "*,accounts(*), fees(*), rsvp(*, people(*)), parent_id(*), events(*)",
        )
        .eq("id", params.id)
        .single();
      console.log(data);
      if (!error && data) {
        console.log("EVENTZZZ", data);
        setEvent(data);
        setParentEvent(data.parent_id);
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

      if (data?.parent_id) {
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

  useEffect(() => {
    const status = getStatus(event, dependant);
    console.log("Current RSVP Status:", status);
  }, [event, dependant]);

  return (
    <div className="mb-20 px-5">
      {event ? (
        <div className="relative mx-auto mt-10">
          <div className="mb-2 flex items-center justify-between">
            <Link href={`/portal/${dependant?.id}`}>
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4" /> Back
              </span>
            </Link>
          </div>
          <div className="relative h-56 w-full">
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
                        <span className="text-black-700 text-sm md:text-lg">
                          {event?.location?.name || event?.location}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center justify-center ">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span className="text-sm md:text-lg">
                            <div className="flex items-center">
                              <div>
                                <span className="mr-1 text-sm md:text-lg">
                                  {formatMonth(event?.schedule?.start_date)}
                                </span>
                                <span className="text-sm md:text-lg">
                                  {formatDay(event?.schedule?.start_date)}
                                </span>
                              </div>
                              {event?.schedule?.end_date && (
                                <div>
                                  -
                                  <span className="mr-1 text-sm md:text-lg">
                                    {formatMonth(event?.schedule?.end_date)}
                                  </span>
                                  <span className="text-sm md:text-lg">
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
                    {!event.parent_id ? (
                      getStatus(event, dependant) !== "paid" ? (
                        <>
                          {event?.fees?.type == "free" ? (
                            <button
                              onClick={updateRSVP}
                              className="flex w-full rounded border-2 border-black bg-black p-2 px-4 text-white hover:bg-black hover:text-white"
                            >
                              {/* <CheckCircle className='h-5 w-5 mr-3' /> */}
                              <span>{`${
                                dependant
                                  ? `RSVP for ${dependant?.first_name}`
                                  : "RSVP"
                              }`}</span>
                            </button>
                          ) : (
                            <GenericButton
                              size="lg"
                              variant="default"
                              classNames={"w-full"}
                              cta={`${
                                dependant
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
                          )}
                        </>
                      ) : (
                        <button className="flex w-full items-center justify-center rounded border bg-lime-500 p-2 px-4">
                          <CheckCircle className="mr-3 h-5 w-5" color="white" />
                          <span className="text-white">Going</span>
                        </button>
                      )
                    ) : isParentPaid ? (
                      isGoing ? (
                        <button className="flex w-full items-center justify-center rounded border bg-lime-500 p-2 px-4">
                          <CheckCircle className="mr-3 h-5 w-5" color="white" />
                          <span className="text-white">Going</span>
                        </button>
                      ) : (
                        <button
                          onClick={updateRSVP}
                          className="flex rounded-full border-2 border-black bg-black p-2 px-4 text-white hover:bg-black hover:text-white "
                        >
                          <span>{`${
                            dependant
                              ? `Register for ${dependant?.first_name}`
                              : "Register"
                          }`}</span>
                        </button>
                      )
                    ) : (
                      <Link
                        href={`/portal/events/${parentEvent?.id}/rsvp?dependent=${currentDependent}`}
                        className="rounded-full border-2 border-black p-2 px-4 text-black hover:bg-black hover:text-white"
                      >
                        Register
                      </Link>
                    )}
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

                        {subEvent?.schedule?.start_time && (
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

export default EventRSVP;
