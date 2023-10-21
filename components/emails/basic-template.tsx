import * as React from 'react';

interface EmailTemplateProps {
  message: string;
}

export const BasicTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  message,
}) => (
  <div>
    <div dangerouslySetInnerHTML={{ __html: message }} />
  </div>
);
