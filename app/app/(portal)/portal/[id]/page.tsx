"use client";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TeamEvents from "@/components/events/team-events";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import { CheckCircleIcon, PlusCircle } from "lucide-react";
import AccountEvents from "@/components/events/account-events";
import AccountPublicEvents from "@/components/events/public-events";

interface Params {
  id: string;
}

const PersonPage = ({ params }: { params: Params }) => {
  const supabase = createClientComponentClient();
  const [account, setAccount] = useState<any>();
  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [independents, setIndependents] = useState<any>(null);
  const [toRelationships, setToRelationships] = useState<any>(null);
  const [rosters, setRosters] = useState<any>(null);

  const [person, setPerson] = useState<any>(null);
  useEffect(() => {
    const getPerson = async () => {
      const { data, error } = await supabase
        .from("people")
        .select("*, accounts(*)")
        .eq("id", params.id)
        .single();

      if (error) toast("Error fetching person.");
      else setPerson(data);
    };

    getPerson();
  }, []);

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
        .order("created_at", { ascending: false });

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
    };

    if (independents && independents.length > 0) fetchToRelationships();
  }, [independents]);

  function hasPaidFee(relation: any, roster: any) {
    // Immediately return true if the fee is 0
    if (roster.fees.amount === 0) {
      return true;
    }

    // Check if there is a payment for the fee by the person
    const paymentsForPerson = roster.fees.payments.filter(
      (payment: { person_id: any }) =>
        payment.person_id === (person?.id || profile?.people.id),
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

  return (
    <div className="p-5">
      <Link href="/portal">
        <span className="flex items-center">
          <ChevronLeft className="h-4 w-4" /> Back
        </span>
      </Link>
      <div className="mt-5">
        <h1 className="text-3xl font-bold">{person?.first_name}</h1>
      </div>

      {/* Events */}
      {rosters?.filter(
        (roster: any) =>
          roster.person_id === (person?.id || profile?.people?.id),
      ).length > 0 && (
        <div className="mt-5">
          <h2 className="text-md font-bold"></h2>Teams
        </div>
      )}
      <div className="my-2">
        {rosters
          ?.filter(
            (roster: any) =>
              roster.person_id === (person?.id || profile?.people?.id),
          )
          .map((roster: any, i: any) => (
            <div key={i} className="">
              <div className="flex w-full justify-between">
                <div>
                  <span className="text-sm">{roster.teams?.name}</span>
                </div>
                <div className="flex items-center justify-end">
                  {hasPaidFee(person || profile, roster) ? (
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
                        person={person || profile?.people}
                      />
                    </GenericButton>
                  )}
                </div>
              </div>
              <div>
                {(person || profile?.people) && (
                  <TeamEvents
                    dependent={person || profile?.people}
                    team={roster.teams?.id}
                    profile={profile}
                  />
                )}
              </div>
              <div className="-mx-1 my-1 mb-5 h-px bg-zinc-100 dark:bg-zinc-800"></div>
            </div>
          ))}
      </div>
      <div>
        {/* This will need to be refactored to handled multiple accounts per person */}
        {person?.accounts && (
          <>
            <h1 className="my-2 text-sm font-semibold">
              Upcoming Events for {person?.accounts.name}
            </h1>
            <AccountPublicEvents
              account={person?.accounts}
              profile={profile}
              selectedDependent={person}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PersonPage;
