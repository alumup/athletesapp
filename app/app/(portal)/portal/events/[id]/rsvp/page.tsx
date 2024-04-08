"use client";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModalMultipleParticipants from "@/components/modal/create-payment-modal-multiple-participants";
import { formatDate } from "@/lib/utils";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ArrowLeftCircleIcon,
  Calendar,
  CalendarIcon,
  CheckCircle,
  HelpCircle,
  Loader,
  MapPin,
  Users,
  XCircle,
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
        .select("*,accounts(*), fees(*), rsvp(*, people(*)), parent_id(*)")
        .eq("id", params.id)
        .single();
      console.log(data)
      if (!error && data) setEvents(data);
      if (currentDependent) {
        const going = data?.rsvp?.find(
          (rs: any) => rs.person_id === currentDependent,
        );
        setDependant(going?.people)
        if (going && going.status === "paid") {
          setIsGoing(true);
        }
      }

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
    <>
      {event ? (
        <div className="relative mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 pb-5 pt-10 shadow">
          <div className="absolute flex items-center justify-between">
            <Link
              href={`/portal`}
              className="cursor rounded p-2"
            >
              <span className="flex items-center space-x-2 text-sm text-gray-700">
                <ArrowLeftCircleIcon fill="white" className="h-8 w-8" />
              </span>
            </Link>
            {/* <span className="text-sm text-white">For {dependant?.name}</span> */}
          </div>
          <img className="rounded-lg object-cover w-full" src={event?.cover_image || "https://framerusercontent.com/images/fp8qgVgSUTyfGbKOjyVghWhknfw.jpg?scale-down-to=512"} alt="" />
          <div style={{ height: '10%' }} className="bottom-0 left-0 right-0 bg-white px-5 md:mx-auto rounded-t-lg">
            <div className="mt-5 p-2">
              <h1 className="mb-5 text-center text-4xl font-normal">
                {`${event?.name}`}
                {event?.parent_id && <span className="text-xl font-medium text-gray-600">{` (${event?.parent_id?.name})`}</span>}
              </h1>
              <p className="mb-5 text-lg text-gray-800">
                {event?.description}
              </p>
              <div className="flex justify-between">
                <div>
                  <div className="flex">
                    <MapPin className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-lg text-black-700">
                        {event?.location?.name || event?.location}
                      </span>
                    </p>
                  </div>
                  <div className="flex">
                    <Calendar className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-lg text-black-700">
                        {" "}
                        {new Date(event?.schedule?.start_date).toDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex">
                    <Users className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-lg text-black-700">
                        {" "}
                        {event?.accounts?.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mb-5 mt-2">
                  <div className="flex mb-1">
                    <CheckCircle color="green" className="mr-3 h-5 w-5" />
                    Going
                  </div>
                  <div className="flex my-1">
                    <XCircle color="red" className="mr-3 h-5 w-5" />
                    Not Going
                  </div>
                  <div className="flex my-1">
                    <HelpCircle className="mr-3 h-5 w-5" />
                    Maybe
                  </div>
                </div>
              </div>

              {/* This section needs refactoring */}
              {!isSession ? (
                !isGoing ? (
                  <div className="col-span-1 flex items-center justify-end">
                    {event?.fees?.type !== "free" ? (
                      <GenericButton
                        size="sm"
                        variant="default"
                        cta={`Pay $${(event?.fees?.amount).toFixed(2)}`}
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
                        className="flex rounded-full bg-white p-2 px-4 border-2 border-black hover:text-white hover:bg-black"
                      >
                        {/* <CheckCircle className='h-5 w-5 mr-3' /> */}
                        <span>Enroll</span>
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
                  <div className="flex justify-end">
                    <button
                      onClick={updateRSVP}
                      className="flex rounded-full bg-white p-2 px-4 border-2 border-black hover:text-white hover:bg-black "
                    >
                      <span className="">Parent Paid - Enroll</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="col-span-1 mt-5 flex items-center justify-end">
                  <Link
                    href={`/portal/events/${parentEvent?.id}/rsvp?dependent=${currentDependent}`}
                    className="rounded-full p-2 px-4 text-black border-2 border-black hover:text-white hover:bg-black"
                  >
                    Pay to Enroll
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center">
          <Loader className="h-10 w-10" />
        </div>
      )}
    </>
  );
};

export default EventRSVP;
