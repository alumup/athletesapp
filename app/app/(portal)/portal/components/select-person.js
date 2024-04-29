'use client'
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from 'next/link';
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';

const SelectPerson = ({ params, relationships }) => {
  const [selectedName, setSelectedName] = useState("Select Dependent");
  const [isLoading, setIsLoading] = useState(true);  // Added loading state
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);



  useEffect(() => {
    const getAccount = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) console.log("Error fetching user: ", error.message);

      // Convert email to lowercase
      const emailLowercase = user?.email?.toLowerCase();

      setUser({ ...user, email: emailLowercase });

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*, senders(*)), people(*)")
        .eq("id", user?.id)
        .single();

      if (profileError)
        console.log("Error fetching profile: ", profileError.message);

      setProfile(profile);
    };

    getAccount();

  }, []);


  useEffect(() => {

    const fetchPerson = async () => {
      setIsLoading(true);  // Set loading to true at the start of data fetch
      if (params?.id) {
        const { data, error } = await supabase
          .from('people')
          .select('name')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Error fetching person:', error);
          setIsLoading(false);  // Set loading to false on error
          return;
        }

        if (data) {
          setSelectedName(data.name);
        } else {
          setSelectedName("Select Dependent");
        }
      }
      setIsLoading(false);  // Set loading to false after data operations
    };

    fetchPerson();
  }, [params?.id, supabase]);

  return (
    <>

      <div className="relative flex py-5 items-center w-full">
        <div className="flex-grow border-t border-50"></div>
        <span className="flex-shrink mx-4 text-gray-400 border rounded-full px-2">Select a Dependent</span>
        <div className="flex-grow border-t border-50"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-5 mb-5 ">
        {isLoading ? (
          <div className="flex items-center justify-center">Loading...</div>  // Display loading message when data is being fetched
        ) : (
          relationships && relationships.map((relation) => (
            <Link
              className="p-3 w-full flex items-center justify-between  bg-gray-50 whitespace-nowrap hover:cursor-pointer rounded  border border-gray-300 hover:bg-gray-100"
              key={relation.to?.id}
              href={`/portal/${relation.to?.id}`}
            >
              <div className="flex items-center">
                <Avatar className="mr-2">
                  <AvatarFallback className="text-black">
                    {getInitials(relation.to?.first_name, relation.to?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{relation.to?.name}</span>
              </div>
              <ChevronRight className='w-5 h-5' />
            </Link>
          ))
        )}

      </div>

      <div className="relative flex py-5 items-center w-full">
        <div className="flex-grow border-t border-50"></div>
        <span className="flex-shrink mx-4 text-gray-400 border rounded-full px-2">Continue as Yourself</span>
        <div className="flex-grow border-t border-50"></div>
      </div>

      <div className="mt-5">
        <Link
          className="p-3 w-full flex items-center justify-between bg-gray-50 whitespace-nowrap hover:cursor-pointer rounded  border border-gray-300 hover:bg-gray-100"
          key={profile?.id}
          href={`/portal/${profile?.people.id}`}
        >
          <div className="flex items-center">
            <Avatar className="mr-2">
              <AvatarFallback className="text-black">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{profile?.people.name}</span>
          </div>
          <ChevronRight className='w-5 h-5' />
        </Link>
      </div>
    </>
  );
};

export default SelectPerson;