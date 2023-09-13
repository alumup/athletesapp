import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


export async function getCollectionClient(collection_id: string) {

  const supabase = createClientComponentClient();
    const { data: collection, error} = await supabase
    .from('collections')
    .select('*, playlists(*, media(*))')
    .eq('id', collection_id)
    .single()

    if (error) {
      console.log("ERROR IN THE getCollection FETCHER")
      return;
    }

    return collection

}

export async function getMediaClient(media_id: string) {

  const supabase = createClientComponentClient();
    const { data: media, error} = await supabase
    .from('media')
    .select('*')
    .eq('id', media_id)
    .single()

    if (error) {
      console.log("ERROR IN THE getMedia FETCHER")
      return;
    }

    return media

}

export async function getSiteId(subdomain: any){
  const supabase = createClientComponentClient();

  const { data } = await supabase
    .from('sites')
    .select('id')
    .eq('subdomain', subdomain)
    .single();
  
  return data?.id || "";
}

export async function getSite(subdomain: any){
  const supabase = createClientComponentClient();

  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('subdomain', subdomain)
    .single();
  
  return data || "";
}
