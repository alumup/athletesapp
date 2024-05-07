"use client";

import React, { useState } from "react";
import { CheckCircleIcon, ChevronRight } from "lucide-react";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import useAccount from "@/hooks/useAccount";
import Link from "next/link";

const Teams = ({ rosters, person }) => {
  const { account } = useAccount();

  return (
    <div className="mt-5 space-y-4">
      {rosters && rosters.length > 0 ? (
        <>
          {rosters.map((roster, i) => (
            <Link
              key={i}
              href={`/portal/teams/${roster.teams?.id}?person=${person.id}`}
              className="flex w-full rounded border border-gray-300 bg-gray-50 px-2 py-4"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-1 text-2xl">🏀</span>
                  <div className="flex flex-col">
                    <span className="text-md font-bold">
                      {roster.teams?.name}
                    </span>
                  </div>
                </div>
                <div>
                  {/* {hasPaidFee(person, roster) ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <GenericButton
                      size="sm"
                      variant="default"
                      classNames=""
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
                  )} */}
                  <ChevronRight className="h-5 w-5 text-black" />
                </div>
              </div>
            </Link>
          ))}
        </>
      ) : (
        <div className="flex h-full min-h-24 w-full flex-col items-center justify-center">
          <p>{person?.first_name} isn't on any teams.</p>
        </div>
      )}
    </div>
  );
};

export default Teams;
