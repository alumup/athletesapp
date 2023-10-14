'use client'
import { Suspense, useEffect, useState } from 'react';
import { useThemeData } from '@/providers/theme-provider';
import Link from 'next/link';
import Image from 'next/image';
import Cart from '@/components/cart';
import OpenCart from '@/components/cart/open-cart';
import { AnimatePresence, motion } from 'framer-motion';


function Navbar({ site, pages }) {
  const { applyTheme, theme } = useThemeData();
  const [isLoading, setIsLoading] = useState(true)

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (site?.theme && theme) {
      setIsLoading(false)
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
              duration: 1
            }
          }} // animate to y: 0
          exit={{ opacity: 0 }}
          className={`theme ${site?.theme?.navbar.theme} bg-background text-foreground z-30 transition-all`}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center space-x-5 py-3 px-3 md:px-0">
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-5">
              <div className="col-span-1 flex items-center justify-start">
                <Link
                  href="/"
                  className="font-semibold text-xl tracking-tight"
                >
                  <Image
                    src={site.logo}
                    alt={site.name}
                    width={50}
                    height={50}
                  />
                </Link>
              </div>

              <div className="col-span-1 hidden md:flex justify-center items-center space-x-2">
                {pages?.map((page) => (
                  <Link key={page.id} href={`/${page.slug}`} className="text-foreground text-xs uppercase">
                    {page.name}
                  </Link>
                ))}
                <Link href="/roster" className="text-foreground text-xs uppercase">
                  Roster
                </Link>
                <Link href="/schedule" className="text-foreground text-xs uppercase">
                  Schedule
                </Link>
              </div>

              <div className="col-span-1 flex items-center justify-end space-x-2">
                <a href="app.athletes.app/login" className="bg-primary text-primary-foreground shadow px-3 py-1.5 text-sm rounded">
                  Donate
                </a>
                <Suspense fallback={<OpenCart />}>
                  <Cart />
                </Suspense>
               
            
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Navbar