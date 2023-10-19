import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getDomainQuery } from "../utils";
import Shopify, { createShopify } from "../shopify";

export async function getAccountWithDomain(domain: string) {
  const supabase = createClientComponentClient();

  const [domainKey, domainValue] = getDomainQuery(domain);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    let account;
    if (user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*)")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      account = profile?.accounts;
    } else if (domain) {
      const { data: site, error: siteError } = await supabase
        .from("sites")
        .select("*, accounts(*)")
        .eq(domainKey, domainValue)
        .single();

      if (siteError) throw siteError;
      account = site?.accounts;
      console.log("ACCOUNT", account)
    }

    return account;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getAccount() {
  const supabase = createClientComponentClient();

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


export async function getCollectionClient(collection_id: string) {
  const supabase = createClientComponentClient();
  const { data: collection, error } = await supabase
    .from("collections")
    .select("*, playlists(*, media(*))")
    .eq("id", collection_id)
    .single();

  if (error) {
    console.log("ERROR IN THE getCollection FETCHER: ", error);
    return;
  }

  return collection;
}

export async function getCollectionByNameClient(name: string, domain: string) {
  const supabase = createClientComponentClient();
  const account = await getAccountWithDomain(domain);
  const { data: collection, error } = await supabase
    .from("collections")
    .select("*, playlists(*, media(*))")
    .eq("name", name)
    .eq("account_id", account?.id)
    .single();

  if (error) {
    console.log("ERROR IN THE getCollectionByName FETCHER: ", error);
    return;
  }

  return collection;
}

export async function getCollectionsClient(account_id: string) {
  const supabase = createClientComponentClient();
  const { data: collections, error } = await supabase
    .from("collections")
    .select("*, playlists(*, media(*))")
    .eq("account_id", account_id);

  if (error) {
    console.log("ERROR IN THE getCollectionsClient FETCHER");
    return;
  }

  return collections;
}

export async function getMediaClient(media_id: string) {
  const supabase = createClientComponentClient();
  const { data: media, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", media_id)
    .single();

  if (error) {
    console.log("ERROR IN THE getMedia FETCHER", error);
    return;
  }

  return media;
}

interface GetRecommendedVideosParams {
  exclude?: string;
  subdomain: string;
}

export async function getRecommendedVideos(
  { exclude, subdomain }: GetRecommendedVideosParams = { subdomain: "" },
) {
  const supabase = createClientComponentClient();

  let decodedDomain = decodeURIComponent(subdomain);

  // Remove 'www.' from the domain if it exists
  if (decodedDomain.startsWith("www.")) {
    decodedDomain = decodedDomain.substring(4);
  }

  try {
    new URL(
      decodedDomain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, ""),
    );
  } catch (error) {
    decodedDomain = decodedDomain.replace(
      `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      "",
    );
  }

  const { data, error } = await supabase
    .rpc("get_site_media", {
      subdomain: decodedDomain,
    })
    .not("id", "in", `(${exclude})`)
    .limit(10);

  if (error) {
    console.log(error);
    return;
  }

  return data;
}

interface GetVideoCollectionParams {
  exclude?: string;
  collectionId: string;
  accountId: string;
}

export async function getVideoCollection({
  collectionId,
  accountId,
}: GetVideoCollectionParams) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from("collections")
    .select("*, media(*)")
    .eq("id", collectionId)
    .eq("account_id", accountId)
    .single();

  if (error) {
    console.log(error);
    return;
  }

  return data;
}

export async function getSiteId(domain: string) {
  const supabase = createClientComponentClient();

  console.log("public root domain", process.env.NEXT_PUBLIC_ROOT_DOMAIN);

  const [domainKey, domainValue] = getDomainQuery(domain);
  console.log(domainKey, domainValue);

  const { data } = await supabase
    .from("sites")
    .select("id")
    .eq(domainKey, domainValue)
    .single();

  return data?.id || "";
}

export async function getSiteData(domain: any) {
  const supabase = createClientComponentClient();

  const [domainKey, domainValue] = getDomainQuery(domain);
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq(domainKey, domainValue)
    .single();

  if (error) {
    console.log("GET SITE DATA", error);
  }

  return data;
}

export async function getShopifyToken(account_id: string) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("shopify_storefront_access_token")
    .eq("id", account_id)
    .single();

  if (error) throw error;

  return data?.shopify_storefront_access_token;
}

export async function getAccountShopify(domain: string) {
  const account = await getAccountWithDomain(domain);
  const shopifyToken = await getShopifyToken(account.id);

  return createShopify(shopifyToken) as Shopify;
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