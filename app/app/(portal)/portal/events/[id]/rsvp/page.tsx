"use client";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModalMultipleParticipants from "@/components/modal/create-payment-modal-multiple-participants";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Calendar,
  CheckCircle,
  HelpCircle,
  Loader,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const EventRSVP = ({ params }: { params: { id: string } }) => {
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [dependants, setDependants] = useState<any>([]);
  const [event, setEvents] = useState<any>();
  const [selectedDependants, setSelectedDependants] = useState<any>([]);

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
        .select("*,accounts(*), fees(*), rsvp(*)")
        .eq("id", params.id)
        .single();

      if (!error && data) setEvents(data);
      const rsvp: any = [];
      data?.rsvp?.forEach((rsv: any) => {
        rsvp.push(rsv.person_id);
      });

      console.log(data, "--- EVENTS DATA ----");
    };

    getEvents();
  }, []);

  useEffect(() => {
    if (user) {
      const getDependents = async () => {
        const { data, error } = await supabase
          .from("relationships")
          .select(
            "*,from:person_id(*, accounts(*)),to:relation_id(*, accounts(*))",
          )
          .eq("person_id", user.user_metadata?.people_id);

        if (!error && data) setDependants(data);
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

  useEffect(() => {
    if (event && dependants.length > 0) {
      const selectedUsers: any[] = [];
      event.rsvp?.forEach((rsv: any) => {
        if (
          dependants?.find(
            (d: any) => d.to.id === rsv.person_id && rsv.status !== "paid",
          )
        ) {
          selectedUsers.push(rsv.person_id);
        }
      });
      setSelectedDependants(selectedUsers);
    }
  }, [dependants]);

  const handleDependantChange = async (e: any) => {
    const dependant = e.target.value;
    if (!selectedDependants.includes(dependant)) {
      // check in event.rsvp as well
      // create participants entry
      const { data, error } = await supabase
        .from("rsvp")
        .insert({
          status: "undecided",
          events_id: event.id,
          person_id: dependant,
          profile_id: user.id,
          payments_id: null,
        })
        .select("*, people(*), profiles(*)")
        .single();

      if (error) toast("Unable to select dependant.");
      else setSelectedDependants([...selectedDependants, dependant]);
    }
  };

  const handleRemoveClick = async (id: any) => {
    const { error } = await supabase
      .from("rsvp")
      .delete()
      .eq("person_id", id)
      .eq("events_id", event.id);

    if (error) toast("Unable to remove dependant.");
    else
      setSelectedDependants((prev: any) =>
        prev.filter((dependantId: any) => dependantId !== id),
      );
  };

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
    else toast("RSVP done.");
  };

  return (
    <>
      {event ? (
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
              <div className="mt-5 p-6">
                <h1 className="mb-8 text-center text-3xl text-4xl font-normal">
                  {`${event?.name}`}
                  <span className="text-xl font-medium text-gray-800">{` (${event?.accounts?.name})`}</span>
                </h1>
                <p className="mb-5 text-lg text-gray-800">
                  {event?.description}
                </p>
                <div>
                  <div className="flex">
                    <MapPin className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-lg text-gray-700">
                        {event?.location?.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex">
                    <Calendar className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-lg text-gray-700">
                        {" "}
                        {event?.schedule?.start_date}
                      </span>
                    </p>
                  </div>
                  <div className="flex">
                    <Users className="mr-3 h-5 w-5" />
                    <p className="mb-2">
                      <span className="text-lg text-gray-700">
                        {" "}
                        {event?.accounts?.name}
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
                <div>
                  <label className="text-gray-800">Select a dependant</label>
                  <select
                    value={selectedDependants}
                    id="dependants"
                    placeholder="Select a dependant"
                    onChange={handleDependantChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option>Select a dependant</option>
                    {dependants?.map((dependant: any) => (
                      <option key={dependant?.to?.id} value={dependant?.to?.id}>
                        {dependant?.to?.name}
                      </option>
                    ))}
                  </select>
                  <ul className="mt-4">
                    {selectedDependants?.map((id: any) => {
                      const dependant = dependants?.find(
                        (d: any) => d.to.id === id,
                      );
                      return (
                        <li
                          className="my-2 flex justify-between rounded border p-2"
                          key={id}
                        >
                          <span>{dependant?.to?.name}</span>
                          <button
                            onClick={() => handleRemoveClick(id)}
                            className="ml-2 text-red-500"
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="col-span-1 mt-5 flex items-center justify-end">
                  {event?.fees?.type !== "free" ? (
                    <GenericButton
                      size="sm"
                      variant="default"
                      cta={`Pay $${(
                        selectedDependants.length * event?.fees?.amount
                      ).toFixed(2)}`}
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
                      className="flex rounded bg-black p-2 px-4"
                    >
                      {/* <CheckCircle className='h-5 w-5 mr-3' /> */}
                      <span className="text-white">Enroll</span>
                    </button>
                  )}
                </div>
              </div>
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
