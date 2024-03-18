"use client";

export function getSchema(callback) {
  const schema = {
    content: {
      type: "html",
      label: "HTML Content",
      value: "Code away...",
    },
  };

  callback(schema);
}
