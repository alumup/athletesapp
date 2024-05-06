"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, ChevronLeft } from "lucide-react";
import { hasPaidFee } from "@/lib/utils";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import useAccount from "@/hooks/useAccount";

const TeamPage = ({ params }: { params: { id: string } }) => {
  const { account } = useAccount();

  const supabase = createClientComponentClient();
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    const getTeam = async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*, rosters(*)")
        .eq("id", params.id)
        .single();

      console.log("TEAM", data);

      if (error) toast("Error fetching team.");
      else setTeam(data);
    };

    getTeam();
  }, []);

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
              <h1 className="text-4xl font-bold">{team?.name}</h1>
            </div>
            <div>
              {/* {hasPaidFee(person, team.roster) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <GenericButton
                  size="sm"
                  variant="default"
                  classNames=""
                  cta={`Pay $${team?.roster.fees?.amount}`}
                >
                  <CreatePaymentModal
                    account={account}
                    profile={profile}
                    roster={team?.roster}
                    fee={1200}
                    person={person}
                  />
                </GenericButton>
              )}  */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
