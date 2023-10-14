import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getAccount } from "@/lib/fetchers/server";
import Image from "next/image";
import Link from "next/link";

export default async function SitePosts({
  params,
}: {
  params: { subdomain: string };
}) {

  const supabase = createServerComponentClient({ cookies });

  const account = await getAccount();


  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('subdomain', params.subdomain)
    .single();


  const url = `${data?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  const getMedia = async () => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('account_id', account.id)

    if (error) {
      console.error(error);
      return;
    }

    return data
  }

  const media = await getMedia()


  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          <a
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${url}`
                : `http://${data.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className="truncate rounded-md bg-stone-100 px-2 py-1 text-base md:text-xl font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            {url} ↗
          </a>
        </h1>
        <Link
          href={`/site/${data.subdomain}/builder?page=home`}
          className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
        >
          Edit Site
        </Link>
      </div>

    </>
  );
}
