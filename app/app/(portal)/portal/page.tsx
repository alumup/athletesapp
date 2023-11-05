import React from 'react';
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { fullName } from "@/lib/utils";
import CreatePaymentModal from '@/components/modal/create-payment-modal';
import GenericButton from "@/components/modal-buttons/generic-button";
import { getAccount } from '@/lib/fetchers/server';
import { CheckBadgeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import EditPersonModal from '@/components/modal/edit-person-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ExternalLinkIcon } from '@radix-ui/react-icons';


export const dynamic = 'force-dynamic'

const PortalPage = async () => {

  const supabase = createServerComponentClient({cookies})
  
  const account = getAccount()

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.log('Error fetching user: ', error.message);
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, accounts(*), people(*)')
    .eq('id', user?.id)
    .single();
  
 
  
  if (profileError) console.log('Error fetching profile: ', profileError.message);


  async function fetchToRelationships() {
    const { data, error } = await supabase
      .from("relationships")
      .select("*,from:person_id(*),to:relation_id(*)")
      .eq("person_id", profile?.people?.id)

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      console.log(data)
    }

    return data
  }


  async function fetchRosters() {
    const { data: roster, error } = await supabase
      .from('rosters')
      .select('*, teams(*), fees(*, payments(*))')
    
    console.log("FEES", roster)
    return roster
  }

  const toRelationships = await fetchToRelationships();
 
  const rosters = await fetchRosters();

  
  return (
    <div className="py-5">
    
      
    <div className="max-w-4xl mx-auto py-10 px-5 border border-gray-300 rounded-xl shadow bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 w-full pb-3">
        <h1 className="text-2xl font-bold">{profile?.name || fullName(profile)}</h1>
      </div>



      <div className="mt-10">
        {toRelationships?.map((relation, i) => (
          <div key={i} className="divide-y divide-gray-300">
            <div className="px-3 py-2 flex flex-col">
              <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-2">
                  <span>
                    {relation.to.aau_number === null || relation.to.aau_number === "" ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{relation.to.first_name} is missing their AAU Number.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </span>
                  <Link href={`/people/${relation.to.id}`} className="font-bold text-md">
                    {relation.to.name || fullName(relation.to)}
                  </Link>
                </div>
           
                <GenericButton cta={`Edit`}>
                  <EditPersonModal person={relation?.to} account={account} />
                </GenericButton> 
              </div>

              <div className="mt-2 w-full flex flex-col md:flex-row items-center justify-between border border-gray-300 rounded-xl bg-white overflow-hidden">
                <div className="flex flex-col p-3">
                  <h3 className="text-sm font-bold">{`${relation.to.first_name}`} needs an AAU Number</h3>
                  <h6 className="text-sm font-light">After you get the number you can update {`${relation.to.first_name}`}'s profile.</h6>
                </div>
                <div className="flex flex-col p-3">
                  <a href="https://play.aausports.org/JoinAAU/MembershipApplication.aspx" className="px-2 py-1 bg-lime-400 text-black rounded text-xs flex flex-shrink items-center space-x-2">
                    Get AAU Number
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <h3 className="mt-5 font-bold text-xs">Fees</h3>
              {rosters?.filter(roster => roster.person_id === relation.to.id).map((roster, i) => (
                <div className="py-2 divide-y divide-solid space-y-2">
                  <div key={i} className="flex flex-col md:flex-row justify-between items-center">
                    <Link href={`/rosters/${roster.id}`} className="text-sm">{roster.teams?.name} ({roster.fees?.name})</Link>
                    <div className="mt-5 md:mt-0 flex justify-end">
                      {roster.fees.payments.some((payment: { status: string }) => payment.status === "succeeded") ? (
                        <CheckBadgeIcon className="w-7 h-6 text-green-500" />
                      ): (
                        <GenericButton cta = {`Pay $${roster.fees?.amount}`}>
                          <CreatePaymentModal account={account} profile={profile} fee={roster.fees} person={relation.to} />
                        </GenericButton>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col divide-y divide-dashed">
                    {roster.fees.payments?.map((payment: { amount: string, status: string }) => (
                      <div className="flex justify-between items-center">
                        <div className="text-xs uppercase">Payment {payment.status}</div>
                        <div className="text-xs">${payment.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}



      </div>
     
      </div>

      <div className="my-10 px-8 py-3 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between border border-gray-300 rounded-xl shadow bg-white overflow-hidden">
        <div className="flex flex-col">
          <h3 className="text-md font-bold">Provo Bulldog Youth Uniform</h3>
          <h6 className="text-sm font-light">Buy your ProLook Reversible jersey.</h6>
        </div>
        <div className="flex flex-col mt-5 md:mtt-0">
          <a href="https://www.provobasketball.com/products/provo-bulldog-youth-uniform" className="px-3 py-1 bg-lime-400 text-black rounded text-sm flex flex-shrink items-center space-x-2">
            Buy Now
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
