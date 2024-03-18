"use client";

export function getSchema(callback) {
  const schema = {
    theme: {
      label: "Theme",
      type: "select",
      options: ["default", "inverted", "tinted", "primary", "secondary"],
      value: "default",
    },
    texture: {
      type: "text",
      label: "Texture",
      default:
        "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
    },
    title: {
      type: "text",
      label: "Title",
      value: "Example Banner Text",
    },
    subtitle: {
      type: "text",
      label: "Subtitle",
      value: "This is the subtitle",
    },
    primaryCta: {
      type: "group",
      label: "Primary CTA",
      properties: {
        text: {
          type: "text",
          label: "Primary CTA",
          value: "Click Me",
        },
        href: {
          type: "text",
          label: "Primary Link",
          value: "/this-is-a-link",
        },
      },
    },
    secondaryCta: {
      type: "group",
      label: "Secondary CTA",
      properties: {
        text: {
          type: "text",
          label: "Secondary CTA",
          value: "Click Me",
        },
        href: {
          type: "text",
          label: "Secondary Link",
          value: "/this-is-a-link",
        },
      },
    },
  };

  callback(schema);
}
