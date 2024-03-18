import * as React from "react";
// import { Tailwind } from '@react-email/tailwind';
// import { Preview } from '@react-email/preview';
// import { Section } from '@react-email/section'

interface EmailTemplateProps {
  account: any;
  person: any;
  preview: string;
  message: string;
}

export const BasicTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  account,
  person,
  preview,
  message,
}) => (
  <div>
    <div dangerouslySetInnerHTML={{ __html: message }} />
  </div>
);
