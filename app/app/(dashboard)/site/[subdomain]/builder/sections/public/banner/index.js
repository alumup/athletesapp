'use client'
import { useEffect } from 'react'
import Link from "next/link";
import { useThemeData } from '@/providers/theme-provider';

function Banner({ id, data }) {

  const { applyTheme, theme } = useThemeData();

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value]);

  return (

    <div key={id} className={`theme ${data?.theme?.value} bg-background text-foreground relative isolate px-3 md:px-5 py-10 md:py-20`}>
      <div className={`max-w-7xl w-full mx-auto h-full`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="order-1 md:order-0 col-span-1">
            {/* <div dangerouslySetInnerHTML={{__html: data?.title?.value}} /> */}
            <h1 className="text-5xl font-primary">{data?.title?.value}</h1>
            <h2 className={`text-base md:text-lg mt-2 font-secondary font-light`}>{data?.subtitle?.value}</h2>
            <div className="mt-8 flex items-center space-x-2">
              {data?.primaryCta && (
                <Link href={data?.primaryCta?.properties?.href.value} className="bg-primary text-primary-foreground shadow px-3 py-2 rounded">{data?.primaryCta?.properties?.text.value}</Link>
              )}
            </div>
            {/* <div className="mt-8">
              <h3 className="text-lg font-bold text-foreground">Or find us on:</h3>
              <div className="flex space-x-4 mt-4">
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/spotify.svg" alt="Spotify" className="w-8 h-8" />
                </a>
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/apple-podcasts.svg" alt="Apple Podcasts" className="w-8 h-8" />
                </a>
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/google-podcasts.svg" alt="Google Podcasts" className="w-8 h-8" />
                </a>
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/soundcloud.svg" alt="Soundcloud" className="w-8 h-8" />
                </a>
              </div>
            </div> */}
            
          </div>
          <div className="order-0 md:order-1 col-span-1 aspect-video bg-zinc-900 rounded-lg overflow-hidden shadow-lg flex justify-center items-center w-full">
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default Banner;
