import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound, redirect } from "next/navigation";
import { getPageDataBySiteAndSlug, getSiteData } from "@/lib/fetchers/server";
import { fontMapper } from "@/styles/fonts";

import Navbar from "@/app/[domain]/components/navigation/header";
import Footer from "@/app/[domain]/components/navigation/footer";

import Script from "next/script";
import { ThemeProvider } from "@/providers/theme-provider";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}) {
  const site = await getSiteData(params.domain);
  const page = await getPageDataBySiteAndSlug(site.id, "home");

  return {
    title: site.name || "Gigg",
    description:
      site.description ||
      "A Platform that helps creators and influencers grow their businesses.",
    image: page.image,
    icons: {
      icon: site.fav_icon,
    },
    openGraph: {
      title: site.name,
      description: site.description,
      images: [
        {
          width: 1200,
          height: 630,
          url: site.logo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
      creator: "@gigg",
      images: [`${page.image}`],
    },
  };
}

export async function generateStaticParams() {
  const supabase = createClientComponentClient();

  const { data: subdomains, error: error1 } = await supabase
    .from("sites")
    .select("subdomain");

  if (error1) throw error1;

  const { data: domains, error: error2 } = await supabase
    .from("sites")
    .select("domain")
    .neq("domain", null);

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

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("site_id", data?.id);

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
      <div
        className={`${
          fontMapper[data?.font]
        } smooth-scroll h-full min-h-screen overflow-x-hidden`}
      >
        <ThemeProvider site={data}>
          <Navbar site={data} pages={pages} />
          <div className="h-full min-h-screen">
            {children}
          </div>
          <Footer site={data} />
        </ThemeProvider>
 
      </div>
      <Analytics />
    </>
  );
}
