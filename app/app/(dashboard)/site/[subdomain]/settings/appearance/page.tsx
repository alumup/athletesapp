import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function SiteSettingsAppearance({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", params.id);

  return <div className="flex flex-col space-y-6"></div>;
}
