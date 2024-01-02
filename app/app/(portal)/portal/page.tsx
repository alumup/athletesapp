import React from 'react';
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

import { fullName } from "@/lib/utils";
import CreatePaymentModal from '@/components/modal/create-payment-modal';
import GenericButton from "@/components/modal-buttons/generic-button";
import { getAccount } from '@/lib/fetchers/server';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
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
  
  // Get all of the people that INDEPENDENTS and use the same email as the signed in user

  const { data: independents, error: independentsError } = await supabase
    .from('people')
    .select('*, accounts(*)')
    .eq('dependent', false)
    .eq('email', user?.email);

  console.log("USER EMAIL", user?.email)

  if (independentsError) console.log('Error fetching people with same email: ', independentsError.message);
  
  // console.log("Independents: ", independents)
  // console.log("Prrofile IDs: ", profile.people_ids)



  async function fetchToRelationships() {

    let independentIds = independents?.map(independent => independent.id) || [];

    console.log("IDS", independentIds)
   
    const { data, error } = await supabase
      .from("relationships")
      .select("*, from:person_id(*),to:relation_id(*, accounts(*))")
      .in("person_id", independentIds)

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      console.log("Relationships", data)
    }

    return data
  }


  async function fetchRosters() {
    const { data: roster, error } = await supabase
      .from('rosters')
      .select('*, teams(*), fees(*, payments(*))')
  
    return roster
  }

  const toRelationships = await fetchToRelationships();
 
  let rosters = await fetchRosters();

 

  function hasPaidFee(relation: any, roster: any) {
    // Check if there is a payment for the fee by the person
    const paymentsForPerson = roster.fees.payments.filter((payment: { person_id: any; }) => payment.person_id === relation.to.id);

    // Sort the payments by date, most recent first
    paymentsForPerson.sort((a: { date: string; }, b: { date: string; }) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Check if any of the payments status are 'succeeded'
    const succeededPayment = paymentsForPerson.find((payment: { status: string; }) => payment.status === 'succeeded');

    // If there is a 'succeeded' payment, return true
    if (succeededPayment) {
      return true;
    }

    // If there is no 'succeeded' payment, return false
    return false;
  }
  
  return (
    <div className="py-5">
    
    
      
    <div className="max-w-4xl mx-auto py-10 px-5 border border-gray-300 rounded-xl shadow bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 w-full pb-3">
          <h1 className="text-2xl font-bold">{profile?.name || fullName(profile)}</h1>
          <button className="bg-black text-white text-sm rounded px-3 py-1">Edit Profile</button>
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
                  <span className="font-bold text-md">
                    {relation.to.name || fullName(relation.to)} 
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-900">{relation.to.accounts.name}</span>
                </div>
           
                <GenericButton cta={`Edit`} size="sm" variant="outline">
                  <EditPersonModal person={relation?.to} account={account} />
                </GenericButton> 
              </div>

              {relation.to.aau_number === null || relation.to.aau_number === "" ? (
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
              ) : null }
              
              <h3 className="mt-5 font-bold text-xs">Fees</h3>
              <div className="py-2 divide-y divide-solid space-y-2">
                {rosters?.filter(roster => roster.person_id === relation.to.id).map((roster, i) => (
                  <div key={i} className="last:pt-2 grid grid-cols-2 items-center gap-3">
                    <div className="col-span-1">
                      <span className="text-sm">{roster.teams?.name} ({roster.fees?.name})</span>
                    </div>
                    <div className="col-span-1 mt-5 md:mt-2 flex items-center justify-end">  
                      {hasPaidFee(relation, roster) ? 
                        <CheckCircleIcon className="w-6 h-6 text-lime-500" /> :
                        <GenericButton size="sm" variant="default" cta={`Pay $${roster.fees?.amount}`}>
                          <CreatePaymentModal account={account} profile={profile} roster={roster} fee={roster.fees} person={relation.to} />
                        </GenericButton>
                      }  
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}



      </div>
     
      </div>

      {/* <div className="my-10 px-8 py-3 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between border border-gray-300 rounded-xl shadow bg-white overflow-hidden">
        <div className="flex flex-col">
          <h3 className="text-md font-bold">Provo Bulldog Youth Uniform</h3>
          <h6 className="text-sm font-light">Buy your ProLook Reversible jersey.</h6>
        </div>
        <div className="flex flex-col mt-5 md:mtt-0">
          <a href="https://provobasketball.com/products/provo-basketball-youth-uniform" target="_blank" className="px-3 py-1 bg-lime-400 text-black rounded text-sm flex flex-shrink items-center space-x-2">
            Buy Now
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div> */}
    </div>
  );
};

export default PortalPage;
