'use client'

import { usePageData } from "@/providers/page-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useParams } from 'next/navigation'

export default function PageSelector({pages }: {pages: any }) {

  const { activePage, setActivePage } = usePageData();
  const supabase = createClientComponentClient();
  const router = useRouter()
  const params = useParams()

  
  const handleSelectChange = async (event: any) => {
    const newPageId = event.target.value;
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', newPageId)
      .single();
  
    if (error) {
      console.error('Error fetching page:', error);
    } else {
      setActivePage(data);
      router.push(`/site/${params.subdomain}/builder?page=${data.slug}`)
      router.refresh()
    }
  };

  return (
  <select 
    className="bg-white text-gray-700 w-full border border-gray-300 rounded p-2" 
    onChange={handleSelectChange}
    value={activePage?.id}
  >
    {pages?.map((page: any) => (
      <option key={page.id} value={page.id}>{page.name}</option>
    ))}
  </select>
  )
}