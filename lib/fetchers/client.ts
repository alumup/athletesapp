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
        .select("*, accounts(*, senders(*))")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      account = profile?.accounts;
    } else if (domain) {
      const { data: site, error: siteError } = await supabase
        .from("sites")
        .select("*, accounts(*, senders(*))")
        .eq(domainKey, domainValue)
        .single();

      if (siteError) throw siteError;
      account = site?.accounts;
      console.log("ACCOUNT", account);
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
      .select("*, accounts(*, senders(*))")
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
        .from("relationships")
        .select("*")
        .eq("relation_id", person.id)
        .eq("primary", true)
        .single();

      if (relationshipError) {
        console.error(relationshipError);
        return null;
      }

      // Fetch the primary person
      const { data: primaryPerson, error: primaryPersonError } = await supabase
        .from("people")
        .select("*")
        .eq("id", relationship.person_id)
        .single();

      if (primaryPersonError) {
        console.error(primaryPersonError);
        return null;
      }

      // Return the primary person
      return primaryPerson;
    } catch (error) {
      console.error("Error fetching primary contact:", error);
      return null;
    }
  } else {
    // If the person is not a dependent, return the person itself
    return person;
  }
}

export async function getPrimaryContacts(person: any) {
  const supabase = createClientComponentClient();

  if (person?.dependent) {
    try {
      // Fetch the primary relationships
      const { data: relationships, error: relationshipError } = await supabase
        .from("relationships")
        .select("*")
        .eq("relation_id", person.id)
        .eq("primary", true);

      if (relationshipError) {
        console.error(relationshipError);
        return null;
      }

      // Fetch the primary persons
      const primaryPersons = await Promise.all(
        relationships.map(async (relationship: any) => {
          const { data: primaryPerson, error: primaryPersonError } =
            await supabase
              .from("people")
              .select("*")
              .eq("id", relationship.person_id)
              .single();

          if (primaryPersonError) {
            console.error(primaryPersonError);
            return null;
          }

          return primaryPerson;
        }),
      );

      // Filter out any null values (in case of errors)
      return primaryPersons.filter((person) => person !== null);
    } catch (error) {
      console.error("Error fetching primary contacts:", error);
      return null;
    }
  } else {
    // If the person is not a dependent, return the person itself in an array
    return [person];
  }
}
