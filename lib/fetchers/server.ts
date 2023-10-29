import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Shopify, { createShopify } from "../shopify";
import { getDomainQuery } from "../utils";


export async function getAccount() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*, accounts(*)")
      .eq("id", user?.id)
      .single();

    if (profileError) throw profileError;

    return profile.accounts;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getShopifyToken(account_id: string) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("accounts")
    .select("shopify_storefront_access_token")
    .eq("id", account_id)
    .single();

  if (error) throw error;

  return data?.shopify_storefront_access_token;
}

export async function getSiteData(domain: string) {
  const supabase = createServerComponentClient({ cookies });

  const [domainKey, domainValue] = getDomainQuery(domain);

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq(domainKey, domainValue)
    .single();

  return data;
}

export async function getAccountId(domain: string) {
  const supabase = createServerComponentClient({ cookies });

  const [domainKey, domainValue] = getDomainQuery(domain);

  const { data, error } = await supabase
    .from("sites")
    .select("account_id")
    .eq(domainKey, domainValue)
    .single();

  if (error) console.log("ERROR IN THE getAccountId FETCHER", error);

  if (data) {
    console.log("DATA FROM GET ACCOUNT ID", data);
  }
  return data?.account_id;
}

export async function getSiteTheme(domain: string) {
  const supabase = createServerComponentClient({ cookies });

  const [domainKey, domainValue] = getDomainQuery(domain);

  try {
    const { data } = await supabase
      .from("sites")
      .select("theme")
      .eq(domainKey, domainValue)
      .single();

    return data?.theme;
  } catch (error) {
    console.log("ERROR IN THE getSiteTheme FETCHER", error);
    return {};
  }
}


export async function getAccountShopify(domain: string) {
  const accountId = await getAccountId(domain);
  const shopifyToken = await getShopifyToken(accountId);

  return createShopify(shopifyToken) as Shopify;
}



export async function getPageDataBySiteAndSlug(site_id: string, slug: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("site_id", site_id)
    .single();

  if (error) {
    console.log("ERROR IN getPageDataBySiteAndSlug FETCHER");
    return;
  }

  return data;
}


export async function getPrimaryContact(person: any) {
  const supabase = createServerComponentClient({ cookies }); // replace with your Supabase client

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



export async function getPrimaryContacts(person: any) {
  const supabase = createServerComponentClient({ cookies });

  if (person.dependent) {
    try {
      // Fetch the primary relationships
      const { data: relationships, error: relationshipError } = await supabase
        .from('relationships')
        .select('*')
        .eq('relation_id', person.id)
        .eq('primary', true);

      if (relationshipError) {
        console.error(relationshipError);
        return null;
      }

      // Fetch the primary persons
      const primaryPersons = await Promise.all(
        relationships.map(async (relationship: any) => {
          const { data: primaryPerson, error: primaryPersonError } = await supabase
            .from('people')
            .select('*')
            .eq('id', relationship.person_id)
            .single();

          if (primaryPersonError) {
            console.error(primaryPersonError);
            return null;
          }

          return primaryPerson;
        })
      );

      // Filter out any null values (in case of errors)
      return primaryPersons.filter(person => person !== null);
    } catch (error) {
      console.error('Error fetching primary contacts:', error);
      return null;
    }
  } else {
    // If the person is not a dependent, return the person itself in an array
    return [person];
  }
}