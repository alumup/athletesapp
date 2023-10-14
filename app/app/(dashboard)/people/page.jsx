'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import GenericButton from "@/components/modal-buttons/generic-button";
import CreatePersonModal from "@/components/modal/create-person-modal";

import { PeopleTable } from './table'

import { getAccount, getPrimaryContact } from "@/lib/fetchers/client";
import { useEffect, useState } from "react";


export default function PeoplePage() {


  const supabase = createClientComponentClient();
  const [people, setPeople] = useState([])
  const [account, setAccount] = useState(null)


  const fetchPeople = async () => {
    const { data: people, error } = await supabase
    .from("people")
    .select("*")
    // need to get only people that belong to this account

    if (error) {
      console.error(error);
      return;
    }

    if (people) {
      const peopleWithPrimaryEmailPromises = people.map(async (person) => {
        const primaryPerson = await getPrimaryContact(person);
        return {
          ...person,
          primary_contact: primaryPerson,
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
    fetchAccount()
    fetchPeople()
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
          <GenericButton cta="+ New Person">
            <CreatePersonModal account={account} />
          </GenericButton>
        </div>
        <div className="mt-10">
          <PeopleTable data={people} account={account} />
        </div>
      </div>
    </div>
  );
}
