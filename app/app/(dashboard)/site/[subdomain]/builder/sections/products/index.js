'use client'
import React, {useEffect} from 'react';
import { getCollectionProducts } from '@/lib/shopify';
import { GridTileImage } from '@/components/grid/tile';
import Link from 'next/link';

function Products({ id, data }) {

  const [products, setProducts] = React.useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const products = await getCollectionProducts({
          collection: 'home',
          reverse: true,
          sortKey: 'CREATED_AT',
        });
    
        setProducts(products);
        console.log("PRODUCTS", products)
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    }

    getProducts();
  
  }, []);



  return (
      <div key={id} className="py-8 px-3">
        <h2 className="mb-4 text-2xl font-bold">{data?.collection?.value}</h2>
        <ul className="flex w-full gap-4 overflow-x-auto pt-1">
          {products && (
            products?.map((product) => (
              <li
                key={product.handle}
                className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
              >
                <Link className="relative h-full w-full" href={`/products/${product.handle}`}>
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
                </Link>
              </li>
            )))
          }
        </ul>
      </div>
  );
}

export default Products;