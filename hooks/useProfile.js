"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*, accounts(*), people(*)")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile: ", error.message);
        return;
      }

      setProfile(profile);
    };

    fetchProfile();
  }, [userId]);

  return profile;
};
