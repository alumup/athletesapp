'use client'
import React, { useEffect } from 'react';
import { GridTileImage } from '@/components/grid/tile';
import { useShopify } from '@/components/shopify-provider';
import { useThemeData } from '@/providers/theme-provider';

function Products() {
  const shopify = useShopify();
  const [products, setProducts] = React.useState([]);
  const { applyTheme, theme } = useThemeData();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const products = await shopify?.getCollectionProducts({
          collection: 'products',
          reverse: true,
          sortKey: 'CREATED_AT',
        });
        setProducts(products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    }

    getProducts();


  }, [shopify]);

  // useEffect(() => {
  //   if (data?.theme?.value && theme) {
  //     applyTheme(theme);
  //   }
  // }, [data?.theme?.value, theme, applyTheme]);

  return (
    <div className={`theme default py-10 px-3 md:px-5 bg-background text-foreground`}>
      <div className={`max-w-7xl w-full mx-auto h-full`}>
        <h2 className="mb-4 text-2xl font-bold font-primary">Products</h2>
        <ul className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {products && (
            products?.map((product) => (
              <li
                key={product.handle}
                className="aspect-square w-full col-span-1"
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