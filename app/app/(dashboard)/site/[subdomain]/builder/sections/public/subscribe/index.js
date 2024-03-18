"use client";
import React, { useEffect } from "react";
import BasicEmail from "@/components/subscribe-forms/basic-email";
import useAccount from "@/lib/hooks/use-account";
import { useThemeData } from "@/providers/theme-provider";

function Subscribe({ id, data }) {
  const account = useAccount();
  const { applyTheme, theme } = useThemeData();

  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value, theme, applyTheme]);

  return (
    <div
      key={id}
      className={`theme ${data?.theme?.value} relative isolate bg-background px-3 py-10 text-foreground md:px-5 md:py-20`}
    >
      {account && (
        <BasicEmail
          accountId={account?.id}
          title={data?.title?.value}
          subtitle={data?.subtitle?.value}
          btnText={data?.buttonText?.value}
        />
      )}
    </div>
  );
}

export default Subscribe;
