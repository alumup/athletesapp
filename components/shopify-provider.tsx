"use client";

import { getAccount } from "@/lib/fetchers/client";
import Shopify, { createShopify } from "@/lib/shopify";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";

const ShopifyContext = createContext<Shopify | undefined>(undefined);

export function ShopifyProvider({ children }: { children: React.ReactNode }) {
  const [shopify, setShopify] = useState<Shopify | undefined>();
  const params = useParams();
  useEffect(() => {
    const getShopify = async () => {
      const account = await getAccount(
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

export function useCart() {
  const shopify = useShopify();
  const cartId = getCookie("cartId");
  const { data, error, isLoading, mutate } = useSWR(shopify?.getCart ? cartId : null, (shopify as Shopify)?.getCart.bind(shopify));
  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
