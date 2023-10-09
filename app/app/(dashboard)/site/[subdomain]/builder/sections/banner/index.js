'use client'
import Link from "next/link";

function Banner({ id, data }) {

  return (

    <div key={id}>
      <div className={`flex flex-col justify-center items-center px-5 py-10 min-h-[300px] h-full relative group ${data?.theme?.value === 'dark' ? 'bg-gray-300 dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-300'}`}>
        <h1 className={`text-2xl font-bold ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-300'} font-bold`}>{data?.title?.value}</h1>
        <h2 className={`text-base ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-medium`}>{data?.subtitle?.value}</h2>
        <div className="mt-2 flex items-center justify-center space-x-2">
          {data?.primaryCta && (
            <Link href={data?.primaryCta?.properties?.href.value} className="btn-primary">{data?.primaryCta?.properties?.text.value}</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Banner;
