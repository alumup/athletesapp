import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GridTileImage } from "@/components/grid/tile";
import { Gallery } from "@/components/product/gallery";
import { ProductDescription } from "@/components/product/product-description";
import { HIDDEN_PRODUCT_TAG } from "@/lib/constants";
import { Image } from "@/lib/shopify/types";
import { getAccountShopify } from "@/lib/fetchers/server";
import Products from "../components/products";

// export const runtime = 'edge';

// export async function generateMetadata({
//   params,
// }: {
//   params: { handle: string; domain: string };
// }): Promise<Metadata> {
//   const shopify = await getAccountShopify(params.domain);

//   const product = await shopify.getProduct(params.handle);

//   if (!product) return notFound();

//   const { url, width, height, altText: alt } = product.featuredImage || {};
//   const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

//   return {
//     title: product.seo.title || product.title,
//     description: product.seo.description || product.description,
//     robots: {
//       index: indexable,
//       follow: indexable,
//       googleBot: {
//         index: indexable,
//         follow: indexable,
//       },
//     },
//     openGraph: url
//       ? {
//         images: [
//           {
//             url,
//             width,
//             height,
//             alt,
//           },
//         ],
//       }
//       : null,
//   };
// }

export default async function ProductsPage({
  params,
}: {
  params: { domain: string };
}) {
  const shopify = await getAccountShopify(params.domain);


  // const productJsonLd = {
  //   "@context": "https://schema.org",
  //   "@type": "Product",
  //   name: product.title,
  //   description: product.description,
  //   image: product.featuredImage.url,
  //   offers: {
  //     "@type": "AggregateOffer",
  //     availability: product.availableForSale
  //       ? "https://schema.org/InStock"
  //       : "https://schema.org/OutOfStock",
  //     priceCurrency: product.priceRange.minVariantPrice.currencyCode,
  //     highPrice: product.priceRange.maxVariantPrice.amount,
  //     lowPrice: product.priceRange.minVariantPrice.amount,
  //   },
  // };

  return (
    <>
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      /> */}
      <div className="theme">
        <div className="w-full h-[300px] bg-black"></div>
        <Products />
        {/* <div className="mt-10 mx-auto max-w-7xl w-full px-3 md:px-5">
          <h1>Products</h1>
 
        </div> */}
      </div>
    </>
  );
}


