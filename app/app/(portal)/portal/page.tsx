"use client";
import React, { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";


import { BellIcon, PlusCircle } from "lucide-react";
import CreateDependentModal from "@/components/modal/create-dependent-modal";
import IconButton from "@/components/modal-buttons/icon-button";
import SelectPerson from "./components/select-person";

const PortalPage = () => {
  const supabase = createClient();

  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [independents, setIndependents] = useState<any>(null);
  const [toRelationships, setToRelationships] = useState<any[]>([]);


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

    };

    getAccount();

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
  }, [supabase, user]);

  useEffect(() => {
    const fetchToRelationships = async () => {
      let independentIds =
        independents?.map((independent: any) => independent.id) || [];

      const { data, error } = await supabase
        .from("relationships")
        .select("*, from:person_id(*),to:relation_id(*, accounts(*))")
        .in("person_id", independentIds);

      if (error) {
        console.error(error);
        return;
      }

      if (data && data.length > 0) {
        setToRelationships(data);
      } else {
        setToRelationships([]);
      }

    };

    if (independents && independents.length > 0) fetchToRelationships();
  }, [independents]);


  return (
    <div className="mt-10 p-5">
      {!profile?.people?.dependent && (
        <>
          <div className="flex w-full justify-start rounded-md border bg-lime-50 px-2 py-3 hover:cursor-pointer hover:bg-gray-100">
            <div className="flex items-center">
              <BellIcon className="h-7 w-7" color="green" />
            </div>
            <div className="ml-2">
              <span className="text-lg font-semibold uppercase">
                Managing Your Athlete?
              </span>
              <p className="break-words text-sm font-light">
                ADD THEM TO YOUR ACCOUNT OR SELECT THEM FROM THE LIST BELOW.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <IconButton
              className="flex w-full justify-start whitespace-nowrap rounded border bg-gray-50 p-2 hover:cursor-pointer hover:bg-gray-100"
              cta="New Dependent"
              icon={<PlusCircle className="h-5 w-5" />}
            >
              <CreateDependentModal person={profile?.people} dependent={true} />
            </IconButton>
          </div>
        </>
      )}

      <div className="mt-5">
        {toRelationships ? (
          <SelectPerson relationships={toRelationships} params={undefined} />
        ) : (
          <p>Loading relationships...</p>
        )}
      </div>
    </div>
  );
};

export default PortalPage;
