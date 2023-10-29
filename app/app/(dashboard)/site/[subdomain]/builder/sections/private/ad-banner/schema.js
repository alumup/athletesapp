
'use client'

export async function getSchema(callback) {
      const schema = {
        theme: {
          label: 'Theme',
          type: 'select',
          options: ['default', 'inverted', 'tinted', 'primary', 'secondary'],
          value: 'default'
        },
      };

      callback(schema);
    
}