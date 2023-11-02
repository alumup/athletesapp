'use client'
import { useEffect, useState } from 'react'
import { useThemeData } from '@/providers/theme-provider';
import Link from 'next/link';
import Image from 'next/image';

function Footer({ site }) {
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
    <div className={`theme ${site?.theme?.navbar.theme} bg-background text-foreground z-30 transition-all py-10`}>
      <div className="w-full max-w-7xl mx-auto px-3 md:px-5 grid grid-cols-1 md:grid-cols-3">
        <div className="col-span-1"></div>
        <div className="col-span-1 flex justify-center items-center">
          <Image
            src={site.logo}
            alt={site.name}
            width={100} height={50}
          />
        </div>
        <div className="col-span-1"></div>
      </div>
      <div className="py-5 px-3 md:px-5  h-full flex flex-col justify-end items-center">
        <div>
          <span className="text-foreground font-bold text-xs">Powered By</span>
        </div>
        <span className="font-bold">Athletes App®</span>
      </div>
    </div>
  )
}

export default Footer;
