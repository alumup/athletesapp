"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import {
  addDomainToVercel,
  // getApexDomain,
  removeDomainFromVercelProject,
  // removeDomainFromVercelTeam,
  validDomainRegex,
} from "@/lib/domains";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { getBlurDataURL } from "@/lib/utils";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

import { unstable_cache } from "next/cache";

export const createPerson = async (data: any, id: string) => {
  const supabase = createServerActionClient({ cookies });

  try {
    const { data: person, error } = await supabase
      .from("person")
      .insert([
        {
          ...data,
        },
      ])
      .single();

    if (error) {
      return {
        error: error.message,
      };
    }

    return person;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const createGroup = async (data: any) => {
  const supabase = createServerActionClient({ cookies });

  console.log("CREATE GROUP DATA", data);

  try {
    const { data: group, error } = await supabase
      .from("group")
      .insert([
        {
          name: "The Loonies",
          event_id: "947c19e3-436d-421a-b278-19278de637b1",
        },
      ])
      .single();

    console.log("CREATE GROUP SUPABASE OBJECT", group);

    if (error) {
      return {
        error: error.message,
      };
    }

    return group;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const createSite = async (formData: FormData) => {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const { data: site, error } = await supabase
      .from("sites")
      .insert([
        {
          name,
          description,
          subdomain,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.log("-------- CREATE SITE ERROR ---------", error);
    }

    // Revalidate tags
    await unstable_cache(
      () => Promise.resolve(),
      [`${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`],
      { revalidate: 900 },
    );

    return site;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updateSite = async (
  formData: FormData,
  siteId: string,
  key: string,
) => {
  const supabase = createServerActionClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }

  const value = formData.get(key) as string;
  let siteUpdateData = { [key]: value };

  try {
    let response;

    if (key === "domain") {
      if (value.includes("vercel.pub")) {
        return {
          error: "Cannot use vercel.pub subdomain as your custom domain",
        };

        // if the custom domain is valid, we need to add it to Vercel
      } else if (validDomainRegex.test(value)) {
        siteUpdateData.domain = value;
        await addDomainToVercel(value);

        // empty value means the user wants to remove the custom domain
      } else if (value === "") {
        siteUpdateData.domain = "";
      }

      // if the site had a different custom domain before, we need to remove it from Vercel
      const { data: currentSite, error } = await supabase
        .from("event")
        .select("domain")
        .eq("id", siteId)
        .single();

      if (error) {
        return { error: error.message };
      }

      if (currentSite.domain && currentSite.domain !== value) {
        await removeDomainFromVercelProject(currentSite.domain);
      }
    } else if (key === "image" || key === "logo") {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return {
          error:
            "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – ping @steventey on Twitter for access.",
        };
      }

      const file = formData.get(key) as File;
      const filename = `${nanoid()}.${file.type.split("/")[1]}`;

      const { url } = await put(filename, file, {
        access: "public",
      });

      const blurhash = key === "image" ? await getBlurDataURL(url) : null;
      siteUpdateData[key] = url;
      if (blurhash) siteUpdateData.imageBlurhash = blurhash;
    }

    const { data: updatedSite, error } = await supabase
      .from("event")
      .update(siteUpdateData)
      .eq("id", siteId)
      .select("*")
      .single();

    if (error) {
      if (error.message.includes("constraint violation")) {
        return {
          error: `This ${key} is already taken`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }

    console.log(
      "Updated site data! Revalidating tags: ",
      `${updatedSite.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      `${updatedSite.domain}-metadata`,
    );

    unstable_cache(
      () => Promise.resolve(),
      [
        `${updatedSite.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      ],
      { revalidate: 900 },
    );

    if (updatedSite.domain) {
      unstable_cache(
        () => Promise.resolve(),
        [`${updatedSite.domain}-metadata`],
        { revalidate: 900 },
      );
    }

    return updatedSite;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const deleteSite = async (siteId: string) => {
  const supabase = createServerActionClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }

  const { data: event, error: fetchError } = await supabase
    .from("event")
    .select("subdomain, domain")
    .eq("id", siteId)
    .single();

  if (fetchError || !event) {
    return {
      error: fetchError?.message || "Event not found",
    };
  }

  const { error: deleteError } = await supabase
    .from("event")
    .delete()
    .match({ id: siteId });

  if (deleteError) {
    return {
      error: deleteError.message,
    };
  }

  await unstable_cache(
    () => Promise.resolve(),
    [`${event.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`],
    { revalidate: 900 },
  );
  if (event.domain) {
    await unstable_cache(
      () => Promise.resolve(),
      [`${event.domain}-metadata`],
      { revalidate: 900 },
    );
  }

  return { success: true };
};

export const editUser = async (formData: FormData, key: string) => {
  const supabase = createServerActionClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }

  const value = formData.get(key) as string;

  const { error } = await supabase
    .from("users")
    .update({ [key]: value })
    .eq("id", user.id);

  if (error) {
    return {
      error: error.message,
    };
  }

  return { success: true };
};
