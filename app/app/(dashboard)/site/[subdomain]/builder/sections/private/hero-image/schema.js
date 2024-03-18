"use client";
import { getAccountWithDomain } from "@/lib/fetchers/client";
import { createShopify } from "@/lib/shopify";

export async function getSchema(callback, domain) {
  const account = await getAccountWithDomain(domain);
  if (account?.shopify_storefront_access_token) {
    const shopify = createShopify(account.shopify_storefront_access_token);

    shopify
      .getCollections()
      .then((collections) => {
        const schema = {
          theme: {
            label: "Theme",
            type: "select",
            options: ["default", "inverted", "tinted", "primary", "secondary"],
            value: "default",
          },
          featuredVideo: {
            type: "text",
            label: "Featured Video",
            value: "Insert Video",
          },
          featuredProducts: {
            type: "select",
            label: "Product Collection",
            options: collections.map((collection) => collection.title),
            value: "All",
          },
        };

        callback(schema);
      })
      .catch((error) => {
        console.error("Failed to fetch collections", error);
      });
  } else {
    console.error("No Shopify access token found");
  }
}
