"use client";
import React, { useEffect } from 'react'
import BasicEmail from "@/components/subscribe-forms/basic-email";
import useAccount from "@/lib/hooks/use-account";
import { useThemeData } from '@/providers/theme-provider';

function Subscribe({ id, data }) {
  const account = useAccount();
  const { applyTheme, theme } = useThemeData();

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value]);

  if (!account) return null;

  return (
    <div key={id} className={`theme ${data?.theme?.value} bg-background text-foreground relative isolate px-3 md:px-5 py-10 md:py-20`}>
      <BasicEmail
        accountId={account?.id}
        title={data?.title?.value}
        subtitle={data?.subtitle?.value}
        btnText={data?.buttonText?.value}
      />
    </div>
  );
};

export default Subscribe;
