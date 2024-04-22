"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CheckCircleIcon } from "lucide-react";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import useAccount from "@/hooks/useAccount";

const Teams = ({ selectedDependent, profile }) => {
  const [rosters, setRosters] = useState([]);
  const { account, loading, error } = useAccount();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRosters = async () => {
      if (!selectedDependent) return;

      const { data: roster, error } = await supabase
        .from("rosters")
        .select("*, teams(*), fees(*, payments(*))")
        .eq("person_id", selectedDependent?.to?.id);

      if (error) {
        console.error("Error fetching rosters: ", error.message);
        return;
      }

      setRosters(roster);
      console.log("roster");
    };

    fetchRosters();
  }, [selectedDependent]);

  function hasPaidFee(relation, roster) {
    // Check if there is a payment for the fee by the person
    const paymentsForPerson = roster.fees.payments.filter(
      (payment) => payment.person_id === relation.to.id,
    );

    // Sort the payments by date, most recent first
    paymentsForPerson.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Check if any of the payments status are 'succeeded'
    const succeededPayment = paymentsForPerson.find(
      (payment) => payment.status === "succeeded",
    );

    // If there is a 'succeeded' payment, return true
    if (succeededPayment) {
      return true;
    }

    // If there is no 'succeeded' payment, return false
    return false;
  }

  return (
    <div>
      {rosters.map((roster, i) => (
        <div key={i}>
          <div className="grid grid-cols-3 items-center gap-4 last:pt-2">
            <div className="col-span-2">
              <span className="text-sm">
                {roster.teams?.name} ({roster.fees?.name})
              </span>
            </div>
            <div>
              {hasPaidFee(selectedDependent, roster) ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
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
                    fee={1200}
                    person={selectedDependent.to}
                  />
                </GenericButton>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Teams;
