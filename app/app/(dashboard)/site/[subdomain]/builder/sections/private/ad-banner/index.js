"use client";
import { useEffect } from "react";
import { useThemeData } from "@/providers/theme-provider";

function AdBanner({ id, data }) {
  const { applyTheme, theme } = useThemeData();

  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value, theme]);

  return (
    <div
      key={id}
      className={`theme ${data?.theme?.value} relative isolate bg-background px-3 py-10 text-foreground md:px-5 md:py-20`}
    >
      <div className={`relative z-20 mx-auto h-full w-full max-w-7xl`}>
        <div className="flex h-[125px] w-full items-center justify-center rounded bg-black">
          <h3 className="text-gray-100">Banner Ad</h3>
        </div>
      </div>
    </div>
  );
}

export default AdBanner;
