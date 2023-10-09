'use client'
import { getCollections } from '@/lib/shopify';

export function getSchema(callback) {
  getCollections()
    .then(collections => {
      console.log("COLLECTIONS", collections)
      const schema = {
        theme: {
          label: 'Theme',
          type: 'select',
          options: ['light', 'dark'],
          value: 'light'
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
}