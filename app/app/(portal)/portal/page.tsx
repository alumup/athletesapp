"use client";
import React, { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";


import { PlusCircle, CreditCard } from "lucide-react";
import CreateDependentModal from "@/components/modal/create-dependent-modal";
import IconButton from "@/components/modal-buttons/icon-button";
import SelectPerson from "./components/select-person";
import { toast } from "sonner";

const PortalPage = () => {
  const supabase = createClient();

  const [user, setUser] = useState<any>();
  const [profile, setProfile] = useState<any>();
  const [independents, setIndependents] = useState<any>(null);
  const [showDependentModal, setShowDependentModal] = useState(false);

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
    };

    getAccount();
  }, []);

  useEffect(() => {
    const getIndependents = async () => {
      const { data: independents, error: independentsError } = await supabase
        .from("people")
        .select("*, accounts(*), rosters(*, teams(*), fees(*))")
        .eq("dependent", false)
        .eq("email", user?.email);

      if (independentsError)
        console.log("Error fetching people: ", independentsError.message);

      setIndependents(independents);
    };

    if (user !== null) getIndependents();
  }, [user, supabase]);

  const handleBillingPortal = async () => {
    const response = await fetch('/api/stripe/billing-portal');
    const { url, error } = await response.json();
    
    if (error) {
      toast.error('Failed to access billing portal');
      return;
    }
    
    window.location.href = url;
  };

  return (
    <div className="mt-10 p-5">
      {!profile?.people?.dependent && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex w-full justify-start rounded-md border bg-lime-50 px-2 py-3">
              <div className="ml-2">
                <span className="text-lg font-semibold uppercase">
                  Manage Your Athletes
                </span>
                <p className="break-words text-sm font-light">
                  View and manage roster assignments and fees
                </p>
              </div>
            </div>
            <IconButton
              className="whitespace-nowrap rounded border bg-blue-50 p-2 hover:bg-blue-100"
              cta="View Billing Portal"
              icon={<CreditCard className="h-5 w-5" />}
              onClick={handleBillingPortal}
            />
          </div>
          <div className="mt-5">
            <IconButton
              className="flex w-full justify-start whitespace-nowrap rounded border bg-gray-50 p-2 hover:cursor-pointer hover:bg-gray-100"
              cta="New Athlete"
              icon={<PlusCircle className="h-5 w-5" />}
              onClick={() => setShowDependentModal(true)}
            />
            {showDependentModal && (
              <CreateDependentModal 
                person={profile?.people} 
                dependent={true}
                onClose={() => setShowDependentModal(false)}
              />
            )}
          </div>
        </>
      )}

      <div className="mt-5">
        {independents ? (
          <SelectPerson relationships={independents} params={undefined} />
        ) : (
          <p>Loading athletes...</p>
        )}
      </div>
    </div>
  );
};

export default PortalPage;
