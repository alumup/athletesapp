import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";



export async function getAccount() {
  
  const supabase = createClientComponentClient();

  const { data: { user } } = await supabase.auth.getUser()

  try {

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, accounts(*)')
      .eq('id', user?.id)
      .single();

    if (profileError) throw profileError;

    return profile.accounts;

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}


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

  const { data, error } = await supabase
    .from('sites')
    .select('*, accounts(*)')
    .eq('subdomain', subdomain)
    .single();

  if (error) {
    return error
  }

  if (data) {
    return data
  }

}
