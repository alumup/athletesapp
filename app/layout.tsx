import "@/styles/globals.css";
import "@/styles/slick.css";
import "@/styles/slick-theme.css";

import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import { Metadata } from "next";
import { getSiteTheme } from "@/lib/fetchers/server";
import { headers } from "next/headers";
import { ModalProvider } from "@/components/modal/provider";

function extractSubdomain(host: string) {
  const subdomainMatch = host.match(/^(?:www\.)?(.*?)\.(?:[^.]+\.[^.]+)$/);

  if (subdomainMatch) {
    return subdomainMatch[1];
  } else {
    return host;
  }
}

const getThemeStyles = async () => {
  const headerList = headers();
  const host = headerList.get("host") || "";
  const siteDomain = extractSubdomain(host);
  const theme = await getSiteTheme(siteDomain);

  let themeObject = {} as { [key: string]: string };

  for (const category in theme) {
    for (const variable in theme[category]) {
      themeObject[`--${variable}`] = theme[category][variable];
    }
  }

  return themeObject;
};

const title = "Athletes® App";
const description = "A CRM for your athletes and parents.";

const image = "/og-image.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["https://athletes.app/favicon.ico"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "@athletesapp",
  },
  metadataBase: new URL("https://athletes.app"),
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const themeStyles = await getThemeStyles();
  return (
    <html lang="en" suppressHydrationWarning style={themeStyles}>
      <head>
        <link
          href="https://releases.transloadit.com/uppy/v3.13.1/uppy.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ModalProvider>
            {props.children}
          </ModalProvider>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
