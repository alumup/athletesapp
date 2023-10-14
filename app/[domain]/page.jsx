import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getSiteData } from "@/lib/fetchers/server";

import { PageBuilder } from "@/app/[domain]/components/page-builder";

export async function generateMetadata({ params }) {
  const supabase = createServerComponentClient({ cookies });
  const s = await getSiteData(params.domain);

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "home")
    .eq("site_id", s.id)
    .single();

  if (error) {
    console.log("PAGE ERROR", error);
  }

  return {
    title: page.name,
    description: page.description,
    image: page.image,
    openGraph: {
      title: page.name,
      description: page.description,
      images: [
        {
          width: 1200,
          height: 630,
          url: page.image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.name,
      description: page.description,
      creator: "@athletesapp",
      images: [`${page.image}`],
    },
  };
}

export default function SiteHomePage() {
  return <PageBuilder />;
}
