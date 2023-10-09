import React from "react";
import {
  Html,
  Body,
  Container,
  Tailwind,
  Text,
  Link,
  Preview,
} from "@react-email/components";

type ConfirmEmailTemplateProps = {
  url: string;
};

export function ConfirmEmailTemplate({ url }: ConfirmEmailTemplateProps) {
  return (
    <Html>
      <Preview>Thanks for subscribing!</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container className="p-10">
            <Text className="text-3xl font-bold text-black">
              Please confirm your email
            </Text>
            <Link
              className="mt-30 cursor-pointer text-center text-blue-500"
              href={url}
            >
              Click here
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ConfirmEmailTemplate;
