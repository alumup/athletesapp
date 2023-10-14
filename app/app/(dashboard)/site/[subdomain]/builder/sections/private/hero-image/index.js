'use client'
import Link from "next/link";


function HeroImage({ id, data }) {

  return (

    <div key={id} className={`${data?.theme?.value === 'dark' ? 'dark' : ''} relative isolate px-3 md:px-5 py-10 md:py-20 bg-[url('https://sjfixndadcdgdwavcmew.supabase.co/storage/v1/object/public/sites/4390b1dc-49b6-499b-928c-d96eb70d832e/Distorted-Data-Science-Background-01-1600x1050-v2.jpg')]`}>
      <div className="absolute inset-0  w-full h-full bg-zinc-900/50"></div>
      <div className={`relative max-w-7xl z-20 w-full mx-auto h-full`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="order-1 md:order-0 col-span-1">
            <div dangerouslySetInnerHTML={{__html: data?.title?.value}} />
            <h2 className={`drop-shadow-lg text-xs md:text-sm font-light text-muted md:text-lg mt-2 font-secondary ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-light`}>{data?.subtitle?.value}</h2>
            <div className="mt-8 flex items-center space-x-2">
              {data?.primaryCta && (
                <Link href={data?.primaryCta?.properties?.href.value} className="btn-secondary text-sm uppercase font-primary">{data?.primaryCta?.properties?.text.value}</Link>
              )}
              {data?.secondaryCta && (
                <Link href={data?.secondaryCta?.properties?.href.value} className="btn-outline-secondary text-secondary text-sm font-primary uppercase">{data?.secondaryCta?.properties?.text.value}</Link>
              )}
            </div>

            
          </div>
          <div className="relative order-0 md:order-1 col-span-1 aspect-video bg-zinc-900 rounded-lg shadow-lg flex justify-center items-center w-full before:bg-glow before:w-full before:h-full before:top-0 before:left-0 before:absolute before:[filter:blur(120px)] before:animate-glow">

          </div>
        </div>
       
      </div>
    </div>
  );
}

export default HeroImage;
