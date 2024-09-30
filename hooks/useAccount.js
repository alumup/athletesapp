"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"
// Other imports as necessary

const useAccount = () => {
  const supabase = createClient();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAccount = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setAccount(user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getAccount();
  }, []);

  return { account, loading, error };
};

export default useAccount;
