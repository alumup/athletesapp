"use client";
import { Suspense, useEffect, useState } from "react";
import { useThemeData } from "@/providers/theme-provider";
import Link from "next/link";
import Image from "next/image";
import Cart from "@/components/cart";
import OpenCart from "@/components/cart/open-cart";
import { AnimatePresence, motion } from "framer-motion";

function Navbar({ site, pages }) {
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
    <AnimatePresence mode="wait">
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }} // start from y: 50
          animate={{
            opacity: 1,
            transition: {
              duration: 1,
            },
          }} // animate to y: 0
          exit={{ opacity: 0 }}
          className={`theme ${site?.theme?.navbar.theme} z-30 bg-background text-foreground transition-all`}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center space-x-5 px-3 py-3 md:px-0">
            <div className="grid w-full grid-cols-2 gap-5 md:grid-cols-3">
              <div className="col-span-1 flex items-center justify-start">
                <a href="/" className="text-xl font-semibold tracking-tight">
                  <Image
                    src={site.logo}
                    alt={site.name}
                    width={50}
                    height={50}
                  />
                </a>
              </div>

              <div className="col-span-1 hidden items-center justify-center space-x-2 md:flex">
                {pages?.map((page) => (
                  <a
                    key={page.id}
                    href={`/${page.slug}`}
                    className="text-xs uppercase text-foreground"
                  >
                    {page.name}
                  </a>
                ))}
              </div>

              <div className="col-span-1 flex items-center justify-end">
                <Suspense fallback={<OpenCart />}>
                  <Cart />
                </Suspense>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
