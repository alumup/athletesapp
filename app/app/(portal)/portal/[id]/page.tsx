"use client";

import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Teams from "../components/teams";
import SheetModal from "@/components/modal/sheet";
import EditPerson from "./edit";

interface Params {
  id: string;
}

const PersonPage = ({ params }: { params: Params }) => {
  const supabase = createClient();
  const [account, setAccount] = useState<any>();
  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [rosters, setRosters] = useState<any>(null);
  const [person, setPerson] = useState<any>(null);
  const [dependents, setDependents] = useState<any[]>([]);

  useEffect(() => {
    const getPerson = async () => {
      const { data, error } = await supabase
        .from("people")
        .select(`
          *,
          accounts(*),
          dependents:relationships!relation_id(
            *,
            dependent:person_id(*)
          )
        `)
        .eq("id", params.id)
        .single();

      if (error) {
        toast("Error fetching person.");
      } else {
        setPerson(data);
        if (data.dependents) {
          const deps = data.dependents.map((rel: any) => rel.dependent);
          setDependents(deps);
        }
      }
    };

    getPerson();
  }, [params.id]);

  useEffect(() => {
    const getAccount = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) console.log("Error fetching user: ", error.message);

      const emailLowercase = user?.email?.toLowerCase();
      setUser({ ...user, email: emailLowercase });

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*), people(*)")
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

      const { data: roster, error } = await supabase
        .from("rosters")
        .select("*, teams!inner(*), fees(*, payments(*))")
        .eq("person_id", personId)
        .eq("teams.is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching rosters:", error);
        return;
      }

      // Check if the person or profile is on staff
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("*, people(*), teams!inner(*)")
        .eq("person_id", personId)
        .eq("teams.is_active", true);

      if (staffError) {
        console.error("Error fetching staff status:", staffError);
        return;
      }

      if (staffData.length > 0) {
        const mergedRosters = [...roster, ...staffData];
        setRosters(mergedRosters);
      } else {
        setRosters(roster);
      }
    };

    fetchRosters();
  }, [person, profile]);

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

      {dependents.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="text-xl font-semibold mb-4">Dependents</h2>
          <div className="space-y-3">
            {dependents.map((dependent) => (
              <Link
                key={dependent.id}
                href={`/portal/${dependent.id}`}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{`${dependent.first_name} ${dependent.last_name}`}</p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 mt-5">
        <div className="flex items-center">
          <Trophy className="mr-1 h-4 w-4" />
          <h2 className="text-md font-bold">Teams & Fees</h2>
        </div>

        <Teams 
          person={person} 
          rosters={rosters} 
        />
      </div>
    </div>
  );
};

export default PersonPage;
