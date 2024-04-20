"use client";
import React, { useEffect, useState } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"; // will use carousel later instead of scroll
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlarmClock,
  CheckCircleIcon,
  Clock,
  Loader,
  MapPin,
  PlusCircle,
} from "lucide-react";
import AccountEvents from "@/components/events/account-events";
import TeamEvents from "@/components/events/team-events";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import { useSearchParams } from "next/navigation";
import CreateDependentModal from "@/components/modal/create-dependent-modal";
import IconButton from "@/components/modal-buttons/icon-button";
import AccountPublicEvents from "@/components/events/public-events";

const PortalPage = () => {
  const supabase = createClientComponentClient();

  const searchParams = useSearchParams();

  const [account, setAccount] = useState<any>();
  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [independents, setIndependents] = useState<any>(null);
  const [toRelationships, setToRelationships] = useState<any>(null);
  const [rosters, setRosters] = useState<any>(null);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<any>(null);
  const [selectedDependent, setSelectedDependent] = useState<any>();

  const from_events = searchParams.get("from_events");

  // const modal = useModal()

  useEffect(() => {
    const getAccount = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) console.log("Error fetching user: ", error.message);

      // Convert email to lowercase
      const emailLowercase = user?.email?.toLowerCase();

      setUser({ ...user, email: emailLowercase });

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*, senders(*)), people(*)")
        .eq("id", user?.id)
        .single();

      if (profileError)
        console.log("Error fetching profile: ", profileError.message);

      setProfile(profile);
      setAccount(profile?.accounts);
    };

    getAccount();

    const fetchRosters = async () => {
      const { data: roster, error } = await supabase
        .from("rosters")
        .select("*, teams(*), fees(*, payments(*))")
        .order('created_at', { ascending: false });


      setRosters(roster);

    };

    fetchRosters();
  }, []);

  useEffect(() => {
    const getIndependents = async () => {
      const { data: independents, error: independentsError } = await supabase
        .from("people")
        .select("*, accounts(*)")
        .eq("dependent", false)
        .eq("email", user?.email);

      if (independentsError)
        console.log(
          "Error fetching people with same email: ",
          independentsError.message,
        );

      setIndependents(independents);
    };

    if (user !== null) getIndependents();
  }, [user]);

  useEffect(() => {
    const fetchToRelationships = async () => {
      let independentIds =
        independents?.map((independent: any) => independent.id) || [];

      console.log("IDS", independentIds);

      const { data, error } = await supabase
        .from("relationships")
        .select("*, from:person_id(*),to:relation_id(*, accounts(*))")
        .in("person_id", independentIds);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        console.log("Relationships", data);
      }

      setToRelationships(data);
      setSelectedDependent(data[0]);
    };

    if (independents && independents.length > 0) fetchToRelationships();
  }, [independents]);

  function hasPaidFee(relation: any, roster: any) {
    // Check if there is a payment for the fee by the person
    const paymentsForPerson = roster.fees.payments.filter(
      (payment: { person_id: any }) => payment.person_id === relation.to.id,
    );

    // Sort the payments by date, most recent first
    paymentsForPerson.sort(
      (a: { date: string }, b: { date: string }) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Check if any of the payments status are 'succeeded'
    const succeededPayment = paymentsForPerson.find(
      (payment: { status: string }) => payment.status === "succeeded",
    );

    // If there is a 'succeeded' payment, return true
    if (succeededPayment) {
      return true;
    }

    // If there is no 'succeeded' payment, return false
    return false;
  }

  console.log(selectedDependent, "-- selected dependent ----");

  return (
    <div className="">
      {/* Relationships */}
      <div className="flex overflow-x-auto">
        {toRelationships &&
          toRelationships?.map((relation: any) => (
            <div
              onClick={() => setSelectedDependent(relation)}
              className="mx-2 flex items-center whitespace-nowrap rounded-full border p-2 hover:cursor-pointer hover:bg-gray-100"
              key={relation.id}
            >
              <Avatar className="mr-2 h-10 w-10 ">
                <AvatarFallback className="text-black">
                  {getInitials(relation.to?.first_name, relation.to?.last_name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{relation.to?.name}</span>
            </div>
          ))}
        {toRelationships?.length < 1 && (
          <IconButton
            className="mt-2 rounded-full p-4"
            cta="New Dependent"
            icon={<PlusCircle className="h-5 w-5" />}
          >
            <CreateDependentModal person={profile} />
          </IconButton>
        )}
      </div>

      <div className="mx-2 mt-5">
        <h1 className="text-3xl font-bold">
          {selectedDependent?.to.first_name}
        </h1>
      </div>

      {/* Events */}
      {rosters?.filter(
        (roster: any) => roster.person_id === selectedDependent?.to?.id,
      ).length > 0 && <span className="mx-2 mt-10 font-bold">Teams</span>}
      <div className="mx-2 my-5 mt-2">
        {rosters
          ?.filter(
            (roster: any) => roster.person_id === selectedDependent?.to?.id,
          )
          .map((roster: any, i: any) => (
            <div key={i}>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="col-span-2">
                  <span className="text-sm">
                    {roster.teams?.name}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  {hasPaidFee(selectedDependent, roster) ? (
                    <CheckCircleIcon className="h-5 w-5 text-lime-500" />
                  ) : (
                    <GenericButton
                      size="sm"
                      variant="default"
                      cta={`Pay $${roster.fees?.amount}`}
                    >
                      <CreatePaymentModal
                        account={account}
                        profile={profile}
                        roster={roster}
                        fee={roster.fees}
                        person={selectedDependent.to}
                      />
                    </GenericButton>
                  )}
                </div>
              </div>
              <div className="my-5">
                {selectedDependent && (
                  <TeamEvents dependent={selectedDependent} profile={profile} team={roster.teams?.id} />
                )}
              </div>
              <div className="-mx-1 my-1 h-px bg-zinc-100 dark:bg-zinc-800 mb-5"></div>
            </div>
          ))}
      </div>
      <div>
        {account && (
          <>
            <h1 className="text-md my-2 font-semibold">
              Upcoming Events for {account?.name}
            </h1>
            <AccountPublicEvents
              account={account}
              profile={profile}
              selectedDependent={selectedDependent}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PortalPage;