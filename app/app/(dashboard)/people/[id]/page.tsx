
'use client'
import {useState, useEffect, Key} from 'react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { getAccount, getPrimaryContact } from "@/lib/fetchers/client";
import GenericButton from "@/components/modal-buttons/generic-button";
import EditPersonModal from "@/components/modal/edit-person-modal";
import { fullName } from "@/lib/utils";
import { toast } from 'sonner';
import LoadingDots from '@/components/icons/loading-dots';



export default function PersonPage({
  params
}: {
  params: { id: string }
}) {

  const supabase = createClientComponentClient()


    const [person, setPerson] = useState<any>(null);
    const [toRelationships, setToRelationships] = useState<any>(null);
    const [fromRelationships, setFromRelationships] = useState<any>(null);
    const [account, setAccount] = useState<any>(null);
  const [emailIsSending, setEmailIsSending] = useState<any>(false)
  

  const invitePerson = async ({ person, account }: { person: any, account: any }) => {
    setEmailIsSending(true)
    const response = await fetch('/api/invite-person', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ person: person, account: account, subject: `You've Been Invited to Athletes App!` }),
    });

    if (!response.ok) {
      setEmailIsSending(false)
      toast.error('Invite did not work')
    }

    if (response.ok) {
      setEmailIsSending(false)
      toast.success(`${person.first_name} has been invited!`)
    }
  };

    useEffect(() => {
      async function fetchData() {
        const fetchedPerson = await fetchPerson();
        // Fetch primary contact for the person
        const primaryPerson = await getPrimaryContact(fetchedPerson);

        setPerson({
          ...fetchedPerson,
          primary_contact: primaryPerson
        });

        const fetchedToRelationships = await fetchToRelationships();
        setToRelationships(fetchedToRelationships);

        const fetchedFromRelationships = await fetchFromRelationships();
        setFromRelationships(fetchedFromRelationships);

        const fetchedAccount = await getAccount();
        setAccount(fetchedAccount);
      }

      fetchData();
    }, []);

    async function fetchPerson() {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error(error);
        return;
      }

      return data;
    }

    async function fetchToRelationships() {
      const { data, error } = await supabase
        .from("relationships")
        .select("*,from:person_id(*),to:relation_id(*)")
        .eq("person_id", params.id)

      if (error) {
        console.error(error);
        return;
      }

      return data;
    }

    async function fetchFromRelationships() {
      const { data, error } = await supabase
        .from("relationships")
        .select("*,from:person_id(*),to:relation_id(*)")
        .eq("relation_id", params.id)

      if (error) {
        console.error(error);
        return;
      }

      return data;
    }

  
  return (
    <div className="flex flex-col space-y-12">
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col space-y-0.5">
          <h1 className="truncate font-cal text-base md:text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            {person?.name || fullName(person)}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            {person?.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!person?.dependent && (
              <button onClick={() => invitePerson({ person, account })} className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded">
                {emailIsSending ? <LoadingDots color='#808080' /> : <span>Invite to Portal</span>}
            </button>
          )}

          <GenericButton cta="Edit Person">
            <EditPersonModal person={person} account={account} />
          </GenericButton>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="mb-3 font-bold text-zinc-500 text-xs uppercase">Relationships</h2>
        {toRelationships?.map((relation: any, i: Key | null | undefined) => (
          <div key={i}>
            <div className="border border-stone-200 px-3 py-2 rounded flex items-center space-x-1">
              <div className="flex flex-col">
                <span>{relation.name} of</span>
                <a href={`/people/${relation.to.id}`} className="font-bold text-sm">{relation.to.name || fullName(relation.to)}</a>
              </div>
            </div>
          </div>
        ))}

        {fromRelationships?.map((relation: any, i: Key | null | undefined) => (
          <div key={i}>
            <div className="border border-stone-200 px-3 py-2 rounded flex items-center space-x-1">
              <div className="flex flex-col">
                <span>{relation.name} is</span>
                <Link href={`/people/${relation.from.id}`} className="font-bold text-sm">{relation.from.name || fullName(relation.to)}</Link>
              </div>
            </div>
          </div>
        ))}
    

        
      </div>
    </div>
  </div>
  
  )
}