import React from 'react';
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { fullName } from "@/lib/utils";
import CreatePaymentModal from '@/components/modal/create-payment-modal';
import GenericButton from "@/components/modal-buttons/generic-button";
import { getAccount } from '@/lib/fetchers/server';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';


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
    <div>
      <div className="flex items-center justify-between border-b border-gray-300 w-full pb-3">
        <h1 className="text-2xl font-bold">{profile?.name || fullName(profile)}</h1>
      </div>

      <div className="mt-10">
        {toRelationships?.map((relation, i) => (
          <div key={i} className="divide-y divide-gray-300">
            <div className="px-3 py-2 flex flex-col">
              <div className="flex flex-col">
                <Link href={`/people/${relation.to.id}`} className="font-bold text-sm">{relation.to.name || fullName(relation.to)}</Link>
              </div>              

              <h3 className="mt-5 font-bold text-xs">Fees</h3>
              {rosters?.filter(roster => roster.person_id === relation.to.id).map((roster, i) => (
                <div className="py-2 divide-y divide-solid">
                  <div key={i} className="flex justify-between items-center">
                    <Link href={`/rosters/${roster.id}`} className="text-sm">{roster.teams.name}({roster.fees.name})</Link>
                    <div>
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
  );
};

export default PortalPage;
