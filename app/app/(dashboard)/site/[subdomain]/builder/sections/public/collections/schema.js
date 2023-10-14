'use client'
import { getAccount, getCollectionsClient } from '@/lib/fetchers/client';

export async function getSchema(callback, domain) {
  let collectionsOptions = [];
  const a = await getAccount(domain)
  if (a) {
    const collections = await getCollectionsClient(a?.id);
    collectionsOptions = collections?.map(collection => (collection.name)) || [];
    console.log("COLLECTION OPTIONS", collectionsOptions)

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
      collections: {
        type: 'checkbox',
        label: 'Collections',
        options: collectionsOptions,
        value: []
      }
    };

    callback(schema);
  } else {
    console.log('Failed to fetch collections');
  }
}
