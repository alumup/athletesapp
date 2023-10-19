"use client";

import { getAccountWithDomain } from "@/lib/fetchers/client";
import Shopify, { createShopify } from "@/lib/shopify";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const ShopifyContext = createContext<Shopify>({} as Shopify);

export function ShopifyProvider({ children }: { children: React.ReactNode }) {
  const [shopify, setShopify] = useState<Shopify>({} as Shopify);
  const params = useParams();
  useEffect(() => {
    const getShopify = async () => {
      const account = await getAccountWithDomain(
        (params.domain as string) || (params.subdomain as string),
      );
      if (account?.shopify_storefront_access_token) {
        const shopify = createShopify(account?.shopify_storefront_access_token);
        setShopify(shopify);
      }
    };

    getShopify();
  }, [params.domain, params.subdomain]);
  return (
    <ShopifyContext.Provider value={shopify}>
      {children}
    </ShopifyContext.Provider>
  );
}

export function useShopify() {
  return useContext(ShopifyContext);
}
