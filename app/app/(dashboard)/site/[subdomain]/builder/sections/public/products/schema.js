'use client'
import { getAccount } from "@/lib/fetchers/client";
import { createShopify } from "@/lib/shopify";

export async function getSchema(callback, domain) {
  const account = await getAccount(domain);
  if (account?.shopify_storefront_access_token) {
    const shopify = createShopify(account.shopify_storefront_access_token);

    shopify.getCollections()
      .then(collections => {
        console.log("COLLECTIONS", collections)
        const schema = {
          theme: {
            label: 'Theme',
            type: 'select',
            options: ['default', 'inverted', 'tinted', 'primary', 'secondary'],
            value: 'default'
          },
          title: {
            type: 'text',
            label: 'Title',
            value: 'Example Banner Text',
          },
          subtitle: {
            type: 'text',
            label: 'Subtitle',
            value: 'This is the subtitle',
          },
          collection: {
            type: 'select',
            label: 'Collection',
            options: collections.map(collection => collection.title),
            value: 'All',
          }
        };

        callback(schema);
      })
      .catch(error => {
        console.error('Failed to fetch collections', error);
      });
  } else {
    console.error('No Shopify access token found');
  }
}
