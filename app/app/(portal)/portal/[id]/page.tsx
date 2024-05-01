"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Calendar, ChevronLeft, Loader, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TeamEvents from "@/components/events/team-events";
import Teams from "../components/teams"
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

    const fetchRosters = async () => {
      const { data: roster, error } = await supabase
        .from("rosters")
        .select("*, teams(*), fees(*, payments(*))")
        .order("created_at", { ascending: false });

      setRosters(roster);
    };

    fetchRosters();
  }, [params.id]);


  useEffect(() => {
    // Assuming person and profile are defined and used for filtering
    const filtered = rosters?.filter(
      (roster: any) => roster.person_id === (person?.id || profile?.people?.id)
    );
    setFilteredRosters(filtered);
  }, [rosters, person, profile]);

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
      <div className="p-5 bg-gray-100">
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
              <Link href="/portal">Edit</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="my-2">
          <div className="mt-5 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <h2 className="text-md font-bold">Team Events</h2>
          </div>
          <div className="w-full h-72">
            {filteredRosters ? (
              <TeamEvents
                dependent={person || profile?.people}
                rosters={filteredRosters}
                profile={profile}
              />
            ) : (
              <div className="h-full flex justify-center items-center">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
              )}
          </div>
          <div className="mt-5 flex items-center">
            <Trophy className="w-4 h-4 mr-1" />
            <h2 className="text-md font-bold">Teams</h2>
          </div>

          <Teams person={person} rosters={filteredRosters} profile={profile} />

        </div>
      </div>

      <div className="mt-5 px-5 py-5 pb-10 bg-gray-100">
        {/* This will need to be refactored to handled multiple accounts per person */}
        {person?.accounts && (
          <>
            <h2 className="my-2 text-sm font-bold">
              Upcoming Events for {person?.accounts.name}
            </h2>
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
