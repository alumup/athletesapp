import { AddToCart } from "@/components/cart/add-to-cart";
import Price from "@/components/price";
import Prose from "@/components/prose";
import { Product } from "@/lib/shopify/types";
import { VariantSelector } from "./variant-selector";

export const revalidate = 0;

export function ProductDescription({ product }: { product: Product }) {
  console.log("product", product);

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-3xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-primary p-2 text-sm text-primary-foreground">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>

      {product.descriptionHtml ? (
        <Prose
          className="text-md text-light mb-6 leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : null}

      <VariantSelector options={product.options} variants={product.variants} />

      <AddToCart
        variants={product.variants}
        availableForSale={product.availableForSale}
      />
    </>
  );
}
