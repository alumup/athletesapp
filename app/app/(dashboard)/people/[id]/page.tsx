"use client";
import { useState, useEffect, Key } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { getAccount, getPrimaryContacts } from "@/lib/fetchers/client";
import GenericButton from "@/components/modal-buttons/generic-button";
import EditPersonModal from "@/components/modal/edit-person-modal";
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
  CardDescription,
} from "@/components/ui/card";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import LoadingCircle from "@/components/icons/loading-circle";

import SheetModal from "@/components/modal/sheet";
import EditPerson from "./edit";
import { encryptId } from "@/app/utils/ecryption";

export default function PersonPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();

  const [person, setPerson] = useState<any>(null);
  const [toRelationships, setToRelationships] = useState<any>(null);
  const [fromRelationships, setFromRelationships] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [emailIsSending, setEmailIsSending] = useState<any>(false);
  const [profile, setProfile] = useState<boolean>(true);
  const [roster, setRoster] = useState<any[]>([]);
  // Added fetchRoster function
  async function fetchRoster() {
    const { data, error } = await supabase
      .from("rosters")
      .select("*, teams(*)")
      .eq("person_id", params.id);

    if (error) {
      console.error(error);
      return;
    }

    setRoster(data.map((entry) => entry.teams));
  }

  useEffect(() => {
    async function fetchData() {
      const fetchedPerson = await fetchPerson();
      // Fetch primary contact for the person
      const primaryPeople = await getPrimaryContacts(fetchedPerson);

      setPerson({
        ...fetchedPerson,
        primary_contacts: primaryPeople,
      });

      const fetchedToRelationships = await fetchToRelationships();
      setToRelationships(fetchedToRelationships);

      const fetchedFromRelationships = await fetchFromRelationships();
      setFromRelationships(fetchedFromRelationships);

      const fetchedAccount = await getAccount();

      const p = await hasProfile({
        ...fetchedPerson,
        primary_contacts: primaryPeople,
      });

      setAccount(fetchedAccount);
      setProfile(p);

      // Call fetchRoster to get the teams the person is on
      fetchRoster();
    }

    fetchData();
  }, [params.id]);

  const invitePerson = async ({
    person,
    account,
  }: {
    person: any;
    account: any;
  }) => {
    setEmailIsSending(true);
    const email = encryptId(person.primary_contacts[0].email);
    const response = await fetch("/api/invite-person", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        person: person,
        account: account,
        subject: `You've Been Invited to Athletes App!`,
      }),
    });

    if (!response.ok) {
      setEmailIsSending(false);
      toast.error(`${response.statusText}`);
    }

    if (response.ok) {
      setEmailIsSending(false);
      toast.success(`${person.first_name} has been invited!`);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const fetchedPerson = await fetchPerson();
      // Fetch primary contact for the person
      const primaryPeople = await getPrimaryContacts(fetchedPerson);

      setPerson({
        ...fetchedPerson,
        primary_contacts: primaryPeople,
      });

      const fetchedToRelationships = await fetchToRelationships();
      setToRelationships(fetchedToRelationships);

      const fetchedFromRelationships = await fetchFromRelationships();
      setFromRelationships(fetchedFromRelationships);

      const fetchedAccount = await getAccount();

      const p = await hasProfile({
        ...fetchedPerson,
        primary_contacts: primaryPeople,
      });

      setAccount(fetchedAccount);
      setProfile(p);
    }

    fetchData();
  }, []);

  async function hasProfile(person: any) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", person?.primary_contacts[0].email)
      .single();

    if (error) {
      console.error(error);
      return false;
    }

    return data ? true : false;
  }

  async function fetchPerson() {
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    return data;
  }

  async function fetchToRelationships() {
    const { data, error } = await supabase
      .from("relationships")
      .select("*,from:person_id(*),to:relation_id(*)")
      .eq("person_id", params.id);

    if (error) {
      console.error(error);
      return;
    }

    return data;
  }

  async function fetchFromRelationships() {
    const { data, error } = await supabase
      .from("relationships")
      .select("*,from:person_id(*),to:relation_id(*)")
      .eq("relation_id", params.id);

    if (error) {
      console.error(error);
      return;
    }

    return data;
  }

  if (!person) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingCircle />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-0.5">
            <h1 className="font-cal truncate text-base font-bold dark:text-white sm:w-auto sm:text-3xl md:text-xl">
              {person?.name || fullName(person)}
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              {person?.email}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!person?.dependent && !profile && (
              <button
                onClick={() => invitePerson({ person, account })}
                className="text-md rounded bg-lime-500 px-3 py-1.5 text-white"
              >
                {emailIsSending ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <span>Invite to Portal</span>
                )}
              </button>
            )}

            <button className="rounded bg-black px-3 py-2 text-white">
              Message
            </button>

            <SheetModal
              cta={`Edit ${person?.first_name}`}
              title={`Edit ${person?.first_name}`}
              description="Edit this person"
            >
              <EditPerson person={person} account={account} />
            </SheetModal>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSignIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15,231.89</div>
              <p className="text-muted-foreground text-xs">
                +20.1% from last year
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <UsersIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-muted-foreground text-xs">
                +180.1% from last year
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">People</CardTitle>
              <ActivityIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-muted-foreground text-xs">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="col-span-1 md:col-span-3"></div>

          <div className="col-span-1 space-y-3">
            <h2 className="mb-3 text-xs font-bold uppercase text-zinc-500">
              Relationships
            </h2>
            {toRelationships?.map(
              (relation: any, i: Key | null | undefined) => (
                <div key={i}>
                  <div className="flex items-center space-x-1 rounded border border-stone-200 px-3 py-2">
                    <div className="flex flex-col">
                      <span>{relation.name} of</span>
                      <Link
                        href={`/people/${relation.to.id}`}
                        className="text-sm font-bold"
                      >
                        {relation.to.name || fullName(relation.to)}
                      </Link>
                    </div>
                  </div>
                </div>
              ),
            )}

            {fromRelationships?.map(
              (relation: any, i: Key | null | undefined) => (
                <div key={i} className="mb-10">
                  <div className="flex items-center space-x-1 rounded border border-stone-200 px-3 py-2">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span>{relation.name} is</span>
                        <Link
                          href={`/people/${relation.from.id}`}
                          className="text-sm font-bold"
                        >
                          {relation.from.name || fullName(relation.to)}
                        </Link>
                      </div>
                      <div>
                        {relation.primary ? (
                          <CheckBadgeIcon className="h-8 w-8 text-lime-500" />
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
            <h2 className="mb-3 pt-10 text-xs font-bold uppercase text-zinc-500">
              All Teams
            </h2>
            {roster.length > 0 ? (
              <ul className="space-y-3">
                {roster.map((team, index) => (
                  <Link
                    key={index}
                    href={`/teams/${team.id}`}
                    className="flex items-center space-x-1 rounded border border-stone-200 px-3 py-2"
                  >
                    {team.name}
                  </Link>
                ))}
              </ul>
            ) : (
              <p>No teams found for this person.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function CreditCardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function DollarSignIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
