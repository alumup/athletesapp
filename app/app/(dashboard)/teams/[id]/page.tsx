"use client";

import { createClient } from "@/lib/supabase/client";

import { TeamTable } from "./table";

import GenericButton from "@/components/modal-buttons/generic-button";
import EditTeamModal from "@/components/modal/edit-team-modal";
import { useEffect, useState } from "react";
import { AddToStaffSheet } from "@/components/modal/add-to-staff-modal";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Calendar } from "lucide-react";

async function getPrimaryContacts(supabase: any, person: any) {
  if (person?.dependent) {
    try {
      // Fetch the primary relationships
      const { data: relationships, error: relationshipError } = await supabase
        .from("relationships")
        .select("*")
        .eq("relation_id", person.id)
        .eq("primary", true);

      if (relationshipError) {
        console.error(relationshipError);
        return null;
      }

      // Fetch the primary persons
      const primaryPersons = await Promise.all(
        relationships.map(async (relationship: any) => {
          const { data: primaryPerson, error: primaryPersonError } =
            await supabase
              .from("people")
              .select("*")
              .eq("id", relationship.person_id)
              .single();

          if (primaryPersonError) {
            console.error(primaryPersonError);
            return null;
          }

          return primaryPerson;
        }),
      );

      // Filter out any null values (in case of errors)
      return primaryPersons.filter((person) => person !== null);
    } catch (error) {
      console.error("Error fetching primary contacts:", error);
      return null;
    }
  } else {
    // If the person is not a dependent, return the person itself in an array
    return [person];
  }
}

export default function TeamPage({ params }: { params: { id: string } }) {
  // const supabase = createServerComponentClient({ cookies })
  const supabase = createClient();

  const [account, setAccount] = useState<any>({});
  const [user, setUser] = useState<any>({});
  const [team, setTeam] = useState<any>({});

  const [peopleWithPrimaryEmail, setPeopleWithPrimaryEmail] = useState<any>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };
    fetchUser();

    async function fetchTeam() {
      const { data: team, error } = await supabase
        .from("teams")
        .select(`
          *,
          accounts(id, stripe_id),
          rosters(*, people(*), fees(*, payments(*))),
          staff(*, people(*))
        `)
        .eq("id", params.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }
      setTeam(team);
    }

    fetchTeam();
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*, senders(*))")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      setAccount(profile.accounts);
    };

    fetchAccount();
  }, [user, supabase]);

  useEffect(() => {
    const getPrimaryEmail = async () => {
      if (team.rosters) {
        const peopleWithPrimaryEmailPromises = team.rosters.map(
          async (r: any) => {
            const primaryPeople = await getPrimaryContacts(supabase, r.people);
            return {
              ...r.people,
              primary_contacts: primaryPeople,
              fees: r.fees || {
                id: "",
                name: "",
                description: "",
                amount: null,
                type: "",
              },
            };
          },
        );

        const peopleWithPrimaryEmails = await Promise.all(
          peopleWithPrimaryEmailPromises,
        );
        setPeopleWithPrimaryEmail(peopleWithPrimaryEmails);
      }
    };

    getPrimaryEmail();
  }, [supabase, team.rosters]);

  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-0.5">
            <h1 className="font-cal truncate text-base font-bold sm:w-auto sm:text-2xl md:text-3xl">
              {team?.name}
            </h1>
          </div>
          {/* <GenericButton cta="Edit Person">
          <EditPersonModal person={person} account={account} />
        </GenericButton> */}
          <div className="flex items-center space-x-2">
            <AddToStaffSheet team={team} />
            <GenericButton
              cta="Edit Team"
              size={undefined}
              variant={undefined}
              classNames=""
            >
              <EditTeamModal team={team} />
            </GenericButton>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="mb-3 text-xs font-bold uppercase text-zinc-500">
            Staff
          </h2>
          <div className="flex space-y-2 overflow-x-auto">
            {team?.staff?.map((staffMember: any, index: number) => (
              <div
                key={index}
                className="flex items-center rounded p-3 text-sm text-gray-700"
              >
                <Avatar className="mr-2">
                  <AvatarFallback className="text-black">
                    {getInitials(
                      staffMember.people?.first_name,
                      staffMember.people?.last_name,
                    )}
                  </AvatarFallback>
                </Avatar>
                {staffMember.people.name}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <h2 className="mb-3 text-xs font-bold uppercase text-zinc-500">
            Roster
          </h2>
          <TeamTable
            data={peopleWithPrimaryEmail}
            team={team}
            account={account}
          />
        </div>
      </div>
    </div>
  );
}
