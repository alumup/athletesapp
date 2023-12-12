'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


import { PeopleTable } from './table'

import { getAccount, getPrimaryContacts } from "@/lib/fetchers/client";
import { useEffect, useState } from "react";
import SheetModal from "@/components/modal/sheet";
import NewPerson from "./new";

export default function PeoplePage() {


  const supabase = createClientComponentClient();
  const [people, setPeople] = useState([])
  const [account, setAccount] = useState(null)


  const fetchPeople = async (account) => {
    const { data: people, error } = await supabase
      .from("people")
      .select("*")
      .eq('account_id', account?.id)
    // need to get only people that belong to this account

    if (error) {
      console.error(error);
      return;
    }

    if (people) {
      const peopleWithPrimaryEmailPromises = people.map(async (person) => {
        const primaryPeople = await getPrimaryContacts(person);
        return {
          ...person,
          primary_contacts: primaryPeople,
        };
      });
      const peopleWithPrimaryEmail = await Promise.all(peopleWithPrimaryEmailPromises);
      setPeople(peopleWithPrimaryEmail)
    }
  }

  const fetchAccount = async () => {
    const account = await getAccount()
    setAccount(account)
    return account
  }
  

  
  useEffect(() => {
    const account = fetchAccount()
    account.then(acc => fetchPeople(acc))
    const channel = supabase
    .channel('people')
    .on("postgres_changes",
      {
        event: '*',
        schema: 'public',
        table: 'people'
      },
      () => {
       fetchPeople()
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
  }, [supabase]);
  
  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
              People
            </h1>
          </div>
          <SheetModal cta="+ New Person" title="New Person" description="Add a person to your database">

            <NewPerson account={account} />
          </SheetModal>
        </div>
        <div className="mt-10">
          {people && (
            <PeopleTable data={people} account={account} />
          )}
        </div>
      </div>
    </div>
  );
}
