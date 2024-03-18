"use client";
import { useEffect, useState } from "react";
import { useThemeData } from "@/providers/theme-provider";
import Link from "next/link";
import Image from "next/image";

function Footer({ site }) {
  const { applyTheme, theme } = useThemeData();
  const [isLoading, setIsLoading] = useState(true);

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (site?.theme && theme) {
      setIsLoading(false);
      applyTheme(theme);
    }
  }, [site?.theme]);

  return (
    <div
      className={`theme ${site?.theme?.navbar.theme} z-30 bg-background py-10 text-foreground transition-all`}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 px-3 md:grid-cols-3 md:px-5">
        <div className="col-span-1"></div>
        <div className="col-span-1 flex items-center justify-center">
          <Image src={site.logo} alt={site.name} width={100} height={50} />
        </div>
        <div className="col-span-1"></div>
      </div>
      <div className="flex h-full flex-col  items-center justify-end px-3 py-5 md:px-5">
        <div>
          <span className="text-xs font-bold text-foreground">Powered By</span>
        </div>
        <span className="font-bold">Athletes App®</span>
      </div>
    </div>
  );
}

export default Footer;
