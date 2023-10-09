import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";



export async function getAccount() {
  
    const supabase = createServerComponentClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser()
  
    try {

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, accounts(*)')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      return profile.accounts;

    } catch (error) {
      return {
        error: error.message,
      };
    }
}


export async function getSiteData(domain) {

  const supabase = createServerComponentClient({ cookies });

  console.log("GET SITE DATA DOMAIN: ", domain)

  const decodedDomain = decodeURIComponent(domain)

  const subdomain = decodedDomain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? decodedDomain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

 
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq(subdomain ? 'subdomain' : 'domain', subdomain || domain)
    .single();
  
  if (error) throw error;

  return data;
 
}

export async function getPrimaryContact(person) {
  const supabase = createServerComponentClient({cookies}); // replace with your Supabase client

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


export async function getPostsForSite(domain) {
  const decodedDomain = decodeURIComponent(domain)

  const subdomain = decodedDomain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? decodedDomain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;


  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('subdomain', subdomain.id)

  
  if (error) throw error;

  return data;
  
}


