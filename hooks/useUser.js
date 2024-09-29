"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"

export const useUser = () => {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user: ", error.message);
        return;
      }
      const emailLowercase = user?.email?.toLowerCase();
      setUser({ ...user, email: emailLowercase });
    };

    fetchUser();
  }, []);

  return user;
};
