"use client";
import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

const SelectPerson = ({ params, relationships }) => {
  const [selectedName, setSelectedName] = useState("Select Dependent");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
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
      setIsLoading(true); // Set loading to true at the start of data fetch
      if (params?.id) {
        const { data, error } = await supabase
          .from("people")
          .select("name")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching person:", error);
          setIsLoading(false); // Set loading to false on error
          return;
        }

        if (data) {
          setSelectedName(data.name);
        } else {
          setSelectedName("Select Dependent");
        }
      }
      setIsLoading(false); // Set loading to false after data operations
    };

    fetchPerson();
  }, [params?.id, supabase]);

  return (
    <>
      {!profile?.people?.dependent && (
        <>
          <div className="relative flex w-full items-center py-5">
            <div className="border-50 flex-grow border-t"></div>
            <span className="mx-4 flex-shrink rounded-full border px-2 text-gray-400">
              Select a Dependent
            </span>
            <div className="border-50 flex-grow border-t"></div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-1 ">
            {isLoading ? (
              <div className="flex items-center justify-center">Loading...</div> // Display loading message when data is being fetched
            ) : (
              relationships &&
              relationships.map((relation) => (
                <Link
                  className="flex w-full items-center justify-between whitespace-nowrap  rounded border border-gray-300 bg-gray-50  p-3 hover:cursor-pointer hover:bg-gray-100"
                  key={relation.to?.id}
                  href={`/portal/${relation.to?.id}`}
                >
                  <div className="flex items-center">
                    <Avatar className="mr-2">
                      <AvatarFallback className="text-black">
                        {getInitials(
                          relation.to?.first_name,
                          relation.to?.last_name,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{relation.to?.name}</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ))
            )}
          </div>
          <div className="relative flex w-full items-center py-5">
            <div className="border-50 flex-grow border-t"></div>
            <span className="mx-4 flex-shrink rounded-full border px-2 text-gray-400">
              Continue as Yourself
            </span>
            <div className="border-50 flex-grow border-t"></div>
          </div>
        </>
      )}

      {profile && (
        <div className="mt-5">
          <Link
            className="flex w-full items-center justify-between whitespace-nowrap rounded border border-gray-300 bg-gray-50  p-3 hover:cursor-pointer hover:bg-gray-100"
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
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </>
  );
};

export default SelectPerson;
