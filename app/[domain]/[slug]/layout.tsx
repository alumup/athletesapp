
// export const metadata: Metadata = {
//   title,
//   description,
//   icons: ["https://gigg.com/favicon.ico"],
//   openGraph: {
//     title,
//     description,
//     images: [image],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title,
//     description,
//     images: [image],
//     creator: "@gigg",
//   },
//   metadataBase: new URL("https://gigg.dev"),
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <>
        {children}
      </>

  );
}
