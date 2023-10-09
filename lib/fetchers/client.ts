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

export async function getSiteId(domain: any) {
  const supabase = createClientComponentClient();

  const decodedDomain = decodeURIComponent(domain)

  const subdomain = decodedDomain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? decodedDomain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : domain;

  const { data } = await supabase
    .from('sites')
    .select('id')
    .eq(subdomain ? 'subdomain' : 'domain', subdomain || domain)
    .single();

  return data?.id || "";
}


export async function getSiteData(domain: any) {

  const supabase = createClientComponentClient();


  const decodedDomain = decodeURIComponent(domain)


  const subdomain = decodedDomain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? decodedDomain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : domain;

    console.log("DOMAIN", domain)

    console.log("DECODED DOMAIN", decodedDomain)

    console.log("SUBDOMAIN", subdomain)

 
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq(subdomain ? 'subdomain' : 'domain', subdomain || domain)
    .single();
  
  if (error) {
    console.log("GET SITE DATA", error)
  }

  return data;
 
}


export async function getPrimaryContact(person: any) {
  const supabase = createClientComponentClient(); // replace with your Supabase client

  if (person.dependent) {
    try {
      // Fetch the primary relationship
      const { data: relationship, error: relationshipError } = await supabase
        .from('relationships')
        .select('*')
        .eq('relation_id', person.id)
        .eq('primary', true)
        .single();

      if (relationshipError) {
        console.error(relationshipError);
        return null;
      }

      // Fetch the primary person
      const { data: primaryPerson, error: primaryPersonError } = await supabase
        .from('people')
        .select('*')
        .eq('id', relationship.person_id)
        .single();

      if (primaryPersonError) {
        console.error(primaryPersonError);
        return null;
      }

      // Return the primary person
      return primaryPerson;
    } catch (error) {
      console.error('Error fetching primary contact:', error);
      return null;
    }
  } else {
    // If the person is not a dependent, return the person itself
    return person;
  }
}