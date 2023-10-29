'use client';

export async function getSchema(callback) {
    const schema = {
        theme: {
            label: 'Theme',
            type: 'select',
            options: ['default', 'inverted', 'tinted', 'primary', 'secondary'],
            value: 'default'
        },
        title: {
            label: 'Title',
            type: 'text',
            value: 'Subscribe',
        },
        subtitle: {
            label: 'Subtitle',
            type: 'text',
            value: 'Subscribe to get notified of all my latest videos, posts, and announcements.',
        },
        buttonText: {
            label: 'Button text',
            type: 'text',
            value: 'Subscribe',
        },
    };

    callback(schema);
}
