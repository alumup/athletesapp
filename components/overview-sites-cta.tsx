import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
// import CreateSiteButton from "./create-site-button";
// import CreateSiteModal from "./modal/create-site";
import Link from "next/link";

export default async function OverviewSitesCTA() {

  const supabase = createServerComponentClient({ cookies });

  const {data: sites, error } = await supabase
    .from('sites')
    .select('*')

  return sites && sites.length > 0 ? (
    <Link
      href="/sites"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      View All Sites
    </Link>
  ) : (
    // <CreateSiteButton>
    //   <CreateSiteModal />
    // </CreateSiteButton>
    <button className="bg-zinc-900 text-zinc-50 px-5 py-3 rounded">Button</button>
  );
}
