import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function SiteSettingsIndex({
  params,
}: {
  params: { subdomain: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("subdomain", params.subdomain)
    .single();

  return <div className="flex flex-col space-y-6"></div>;
}
