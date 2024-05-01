"use client";

import React, { useState, } from "react";
import { CheckCircleIcon } from "lucide-react";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import useAccount from "@/hooks/useAccount";

const Teams = ({ rosters, person, profile }) => {
  const { account } = useAccount();


  function hasPaidFee(person, roster) {

    if (roster.fees.amount === 0) {
      return true;
    }
    // Check if there is a payment for the fee by the person
    const paymentsForPerson = roster.fees.payments.filter(
      (payment) => payment.person_id === person.id,
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
    <div className="mt-5 space-y-4">
      {rosters?.map((roster, i) => (
        <div key={i} className="w-full border border-gray-300 bg-gray-50 rounded px-2 py-4">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl mr-1">🏀</span>
              <div className="flex flex-col">
                <span className="text-md font-bold">
                  {roster.teams?.name}
                </span>
                <span className="text-sm font-light">${roster.fees?.amount}</span>
              </div>
            </div>
            <div>
              {hasPaidFee(person, roster) ? (
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
                    person={person}
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
