'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const useUser = () => {
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
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