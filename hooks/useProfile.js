"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

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
