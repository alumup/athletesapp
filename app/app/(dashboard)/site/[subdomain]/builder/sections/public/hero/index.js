
'use client'
import React from 'react';
import { useEffect } from 'react'
import Link from 'next/link';
import { useThemeData } from '@/providers/theme-provider';

function Hero({ id, data }) {
  const { applyTheme, theme } = useThemeData();

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value]);

  return (
    <div key={id} className={`theme ${data?.theme?.value} bg-background text-foreground relative isolate px-3 md:px-5 py-10 md:py-20`}>
        <h1 className={`text-3xl md:text-5xl font-primary font-bold text-foreground text-center`}>{data?.title?.value}</h1>
        <h2 className={`mt-2 text-base md:text-xl text-center font-secondary font-medium text-foreground`}>{data?.subtitle?.value}</h2>
        <div className="mt-5 flex items-center justify-center space-x-2">
          {data.primaryCta && (
          <Link href={data?.primaryCta?.properties?.href.value} className="bg-primary text-primary-foreground shadow px-3 py-2 rounded">{data?.primaryCta?.properties?.text?.value}</Link>
          )}
          {data.secondaryCta && (
            <Link href={data?.secondaryCta?.properties?.href.value} className="border border-primary text-primary px-3 py-2 rounded">{data?.secondaryCta?.properties?.text?.value}</Link>
          )}
        </div>
    </div>
  );
}

export default Hero;