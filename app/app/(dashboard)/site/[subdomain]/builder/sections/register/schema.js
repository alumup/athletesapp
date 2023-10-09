'use client'

export function getSchema(callback) {
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
        event : {
          type: 'text',
          label: 'Event ID',
          value: '24ffc200-a21e-494d-bbb6-92fe641776d7'
        },
        primaryCta: {
          type: 'button',
          label: 'Primary CTA',
          properties: {
            text: {
              type: 'text',
              label: 'CTA',
              value: 'Click Me'
            },
            href: {
              type: 'input',
              label: 'Link',
              value: '/about'
            }
          },
        },
      };

      callback(schema);
    
}