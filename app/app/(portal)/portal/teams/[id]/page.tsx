"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar, ChevronLeft, Loader } from "lucide-react";
import Events from "@/components/events/events";
import { hasPaidFee } from "@/lib/utils";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePaymentModal from "@/components/modal/create-payment-modal";
import useAccount from "@/hooks/useAccount";
import { useSearchParams } from "next/navigation";

const TeamPage = ({ params }: { params: { id: string } }) => {
  const { account } = useAccount();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [team, setTeam] = useState<any>(null);

  const person_id = searchParams.get("person");

  useEffect(() => {
    const getTeam = async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*, rosters(*), events(*, teams(*),rsvp(*))")
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
        <Link href={`/portal/${person_id}`}>
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

      <div className="mb-5 mt-5 py-5">
        <div className="flex items-center px-5">
          <Calendar className="mr-1 h-4 w-4" />
          <h2 className="text-md font-bold">Team Events</h2>
        </div>
        <div className="h-full min-h-52 w-full px-5">
          {team ? (
            <>
              {team.rosters.length > 0 ? (
                <Events events={team.events} person_id={person_id} />
              ) : (
                <div className="flex h-full min-h-48 w-full flex-col items-center justify-center">
                  <p>doesn't have any upcoming team events.</p>
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
    </div>
  );
};

export default TeamPage;
