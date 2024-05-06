"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Calendar, ChevronLeft, Component, Loader, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TeamEvents from "@/components/events/team-events";
import Teams from "../components/teams";
import AccountPublicEvents from "@/components/events/public-events";

import SheetModal from "@/components/modal/sheet";
import EditPerson from "./edit";

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
  const [filteredRosters, setFilteredRosters] = useState([]);

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


  }, [params.id]);


  useEffect(() => {
    const fetchRosters = async () => {
      const personId = person?.id || profile?.people?.id;

      console.log("PROFILE", personId)

      const { data: roster, error } = await supabase
        .from("rosters")
        .select("*, teams(*), fees(*, payments(*))")
        .eq("person_id", personId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching rosters:", error);
        return;
      }

      // Check if the person or profile is on staff
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("*, people(*), teams(*)")
        .eq("person_id", personId);

      if (staffError) {
        console.error("Error fetching staff status:", staffError);
        return;
      }
      console.log("STAFF DATA", staffData)
      // Merge staff data into roster if they are on staff
      if (staffData.length > 0) {
        const mergedRosters = [...roster, ...staffData];
        setRosters(mergedRosters);
      } else {
        setRosters(roster);
      }
    };

    fetchRosters();
  }, [person, profile]);

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

  return (
    <div>
      <div className="bg-gray-100 p-5">
        <Link href="/portal">
          <span className="flex items-center">
            <ChevronLeft className="h-4 w-4" /> Back
          </span>
        </Link>

        <div className="mt-5">
          <div className="flex items-end justify-between">
            {/* <Avatar className="mr-2">
              <AvatarFallback className="text-black">
                {getInitials(
                  person?.first_name,
                  person?.last_name,
                )}
              </AvatarFallback>
            </Avatar> */}
            <div>
              <h1 className="text-3xl font-light">{person?.first_name}</h1>
              <h1 className="text-4xl font-bold">{person?.last_name}</h1>
            </div>
            <div>
              <SheetModal
                cta={`Edit`}
                title={`Edit ${person?.first_name}`}
                description={""}
              >
                <EditPerson person={person} account={account} />
              </SheetModal>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        {person?.accounts && (
          <>
            <div className="flex items-center">
              <Component className="mr-1 h-4 w-4" />
              <h2 className="text-md font-bold">Program Events</h2>
            </div>
            <AccountPublicEvents
              account={person?.accounts}
              profile={profile}
              selectedDependent={person}
            />
          </>
        )}
      </div>

      <div className="mb-5 mt-5 border-y border-gray-300 bg-gray-50 p-5">
        <div className="flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          <h2 className="text-md font-bold">Team Events</h2>
        </div>
        <div className="h-full min-h-52 w-full">
          {rosters ? (
            <>
              {rosters.length > 0 ? (
                <TeamEvents
                  dependent={person || profile?.people}
                  rosters={rosters}
                  profile={profile}
                />
              ) : (
                <div className="flex h-full min-h-48 w-full flex-col items-center justify-center">
                  <p>
                    {person?.first_name} doesn't have any upcoming team events.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center">
              <Loader className="h-5 w-5 animate-spin" />
              <span>Looking for team events...</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5">
        <div className="mt-5 flex items-center">
          <Trophy className="mr-1 h-4 w-4" />
          <h2 className="text-md font-bold">Teams</h2>
        </div>

        <Teams person={person} rosters={rosters} profile={profile} />
      </div>
    </div>
  );
};

export default PersonPage;
