'use client'
import React, { useEffect } from 'react';
import { GridTileImage } from '@/components/grid/tile';
import { useShopify } from '@/components/shopify-provider';
import { useThemeData } from '@/providers/theme-provider';

function Products({ id, data }) {
  const shopify = useShopify();
  const [products, setProducts] = React.useState([]);
  const { applyTheme, theme } = useThemeData();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const products = await shopify?.getCollectionProducts({
          collection: data?.collection?.value,
          reverse: true,
          sortKey: 'CREATED_AT',
        });
        console.log("PRODUCTS", products)
        setProducts(products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    }

    getProducts();

    console.log("COLLECTION VALUE", data?.collection?.value)

  }, [data?.collection?.value, shopify]);

  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value, theme, applyTheme]);

  return (
    <div key={id} className={`theme ${data?.theme?.value} py-10 px-3 md:px-5 bg-background text-foreground`}>
      <div className={`max-w-7xl w-full mx-auto h-full`}>
        <h2 className="mb-4 text-2xl font-bold font-primary">{data?.collection?.value}</h2>
        <ul className="flex w-full gap-4 overflow-x-auto pt-1">
          {products && (
            products?.map((product) => (
              <li
                key={product.handle}
                className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
              >
                <a className="relative h-full w-full" href={`/products/${product.handle}`}>
                  <GridTileImage
                    alt={product.title}
                    label={{
                      title: product.title,
                      amount: product.priceRange.maxVariantPrice.amount,
                      currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                      position: 'bottom'
                    }}
                    src={product.featuredImage?.url}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                  />
                </a>
              </li>
            )))
          }

        </ul>
      </div>
    </div>
  );
}

export default Products;
