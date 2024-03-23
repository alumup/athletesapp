"use client";
import React from "react";
import { useEffect } from "react";

import { useThemeData } from "@/providers/theme-provider";

function Hero({ id, data }) {
  const { applyTheme, theme } = useThemeData();

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value]);

  return (
    <div
      key={id}
      className={`theme ${data?.theme?.value} relative isolate bg-background px-3 py-10 text-foreground md:px-5 md:py-20`}
    >
      <h1
        className={`text-center font-primary text-3xl font-bold text-foreground md:text-5xl`}
      >
        {data?.title?.value}
      </h1>
      <h2
        className={`mt-2 text-center font-secondary text-base font-medium text-foreground md:text-xl`}
      >
        {data?.subtitle?.value}
      </h2>
      <div className="mt-5 flex items-center justify-center space-x-2">
        {data.primaryCta && (
          <a
            href={data?.primaryCta?.properties?.href.value}
            className="rounded bg-primary px-3 py-2 text-primary-foreground shadow"
          >
            {data?.primaryCta?.properties?.text?.value}
          </a>
        )}
        {data.secondaryCta && (
          <a
            href={data?.secondaryCta?.properties?.href.value}
            className="rounded border border-primary px-3 py-2 text-primary"
          >
            {data?.secondaryCta?.properties?.text?.value}
          </a>
        )}
      </div>
    </div>
  );
}

export default Hero;
