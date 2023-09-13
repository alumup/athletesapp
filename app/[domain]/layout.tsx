import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound, redirect } from "next/navigation";
import { getSiteData } from "@/lib/fetchers/server";
import { fontMapper } from "@/styles/fonts";
import Script from 'next/script'

import { ThemeProvider } from "@/providers/theme-provider";
import { PageProvider } from "@/providers/page-provider";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";


export const dynamic = 'force-dynamic'

export async function generateStaticParams() {

  const supabase = createClientComponentClient();

  const { data: subdomains, error: error1 } = await supabase
    .from('sites')
    .select('subdomain')
  
  if (error1) throw error1;

  const { data: domains, error: error2 } = await supabase
    .from('sites')
    .select('domain')
    .neq('domain', null);

  if (error2) throw error2;

  const allPaths = [
    ...subdomains.map(({ subdomain }) => subdomain),
    ...domains.map(({ domain }) => domain),
  ].filter((path) => path) as Array<string>;


  return allPaths.map((domain) => ({
    params: {
      domain,
    },
  }));
   
}

export default async function SiteLayout({
  params,
  children,
}: {
  params: { domain: string };
  children: ReactNode;
}) {
  const { domain } = params;
  const supabase = createClientComponentClient();

  const data = await getSiteData(domain);

  const {data: pages} = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', data?.id)

  

  if (!data) {
    notFound();
  }

  // Optional: Redirect to custom domain if it exists
  if (
    domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
    data.domain &&
    process.env.REDIRECT_TO_CUSTOM_DOMAIN_IF_EXISTS === "true"
  ) {
    return redirect(`https://${data.domain}`);
  }

  return (
    <>
        <Script 
          strategy="beforeInteractive"
          src="https://imasdk.googleapis.com/js/sdkloader/ima3.js" 
        />
        <div className={fontMapper[data?.font]}>
          <div className="sticky ease left-0 right-0 top-0 z-30 bg-stone-900 text-stone-100 transition-all duration-150">
            <div className="mx-auto flex h-full max-w-7xl items-center space-x-5 py-2 px-3 md:px-6 lg:px-8">
              <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-5">
                <div className="col-span-1 w-full flex items-center">
                  <Link 
                    href="/"
                    className="font-semibold text-xl tracking-tight dark:text-white"
                  >
                    {data.name}
                  </Link>
                </div>
                <div className="col-span-1 hidden md:flex justify-center items-center space-x-2">
                  {pages?.map((page) => (
                      <Link key={page.id} href={`/${page.slug}`} className="text-gray-50 text-sm">
                        {page.name}
                      </Link>
                    ))
                  }
                </div>
                <div className="col-span-1 flex w-full justify-end items-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                    aria-controls="mobile-menu"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#fff"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        stroke="#fff"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    <svg
                      className="hidden h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#fff"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        stroke="#fff"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ThemeProvider site={data}>
            <PageProvider>
              <div>{children}</div>
            </PageProvider>
          </ThemeProvider>
          <div className="w-full bg-stone-900">
            <div className="py-10 px-3 md:px-5 lg:px-8 h-full flex flex-col justify-end items-center">
              <div>
                <span className="text-gray-300 font-bold text-xs">Powered By</span>
              </div>
              <Link href="/" className="relative h-24 w-24 flex justify-start items-center">
                <Image
                  alt="Jumpshot"
                  src="/logo-stacked.png"
                  fill
                  className="object-center object-contain"
                />
              </Link>
            </div>
          </div>

        </div>
        <Analytics />
 </>
  );
}
