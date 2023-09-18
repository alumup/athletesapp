import GenericButton from "@/components/modal-buttons/generic-button";
import AddDomainModal from "@/components/modal/add-domain-modal";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";


export default async function SiteSettingsDomains({
  params,
}: {
  params: { subdomain: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('subdomain', params.subdomain)



  return (
    <div className="flex flex-col space-y-6">
      <div className="w-full flex justify-between items-center mt-5">
        <div></div>
        <GenericButton cta="Add Domain">
          <AddDomainModal />
        </GenericButton>
      </div>
      <div className="w-full border border-gray-300 p-3 rounded">
        {data?.map((site, i) => (
          <div key={i} className="flex items-center space-x-5">
            <div className="font-bold">{site.subdomain}.jumpshot.app</div>
            <div className="font-bold">{site.domain}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
