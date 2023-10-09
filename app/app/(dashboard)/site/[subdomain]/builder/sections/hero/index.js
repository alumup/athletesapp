
'use client'
import React from 'react';

function Hero({ id, data }) {

  return (
    <div key={id} className={`flex flex-col justify-center items-center px-5 py-10 min-h-[300px] h-full relative group ${data?.theme?.value === 'dark' ? 'bg-gray-300 dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-300'}`}>
        <h1 className={`text-2xl md:text-4xl font-bold font-primary ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-300'} font-bold`}>{data?.title?.value}</h1>
        <h2 className={`text-base font-secondary ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-medium`}>{data?.subtitle?.value}</h2>
        <div className="mt-5 flex items-center justify-center space-x-2">
          {data.primaryCta && (
            <a href={data?.primaryCta?.properties?.href.value} className="btn-primary">{data?.primaryCta?.properties?.text?.value}</a>
          )}
          {data.secondaryCta && (
            <a href={data?.secondaryCtaCta?.properties?.href.value} className="btn-outline-primary">{data?.secondaryCta?.properties?.text?.value}</a>
          )}
        </div>
    </div>
  );
}

export default Hero;