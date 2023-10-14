

'use client'

export function getSchema(callback) {
      const schema = {
        theme: {
          label: 'Theme',
          type: 'select',
          options: ['default', 'inverted', 'tinted', 'primary', 'secondary'],
          value: 'default'
        },
        backgroundImage: {
          type: 'text',
          label: 'Background Image',
          default: '',
          value: ''
        },
        title: {
          type: 'html',
          label: 'Title',
          value: 'Example Banner Text',
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          value: 'This is the subtitle',
        },
        videoId: {
          type: 'text',
          label: 'Video ID',
          value: 'Insert Video'
        },
        primaryCta: {
          type: 'group',
          label: 'Primary CTA',
          properties: {
            text: {
              type: 'text',
              label: 'Primary CTA',
              value: 'Click Me'
            },
            href: {
              type: 'text',
              label: 'Link',
              value: '/this-is-a-link'
            }
          },
        },
        secondaryCta: {
          type: 'group',
          label: 'Secondary CTA',
          properties: {
            text: {
              type: 'text',
              label: 'Secondary CTA',
              value: 'Click Me'
            },
            href: {
              type: 'text',
              label: 'Link',
              value: '/this-is-a-link'
            }
          },
        },
      };

      callback(schema);
    
}