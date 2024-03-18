"use client";
import { useEffect, useState } from "react";
import CartModal from "./modal";
import { getAccountShopify } from "@/lib/fetchers/client";
import { useParams } from "next/navigation";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const lastPart = parts.pop();
    if (lastPart) {
      const splitParts = lastPart.split(";");
      if (splitParts.length > 0) {
        return splitParts.shift();
      }
    }
  }
}

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [shopify, setShopify] = useState<any>(null);
  const [cartId, setCartId] = useState<any>(null);
  const params = useParams();

  useEffect(() => {
    const initialize = async () => {
      const shopifyInstance = await getAccountShopify(params.domain as string);
      const cartIdValue = getCookie("cartId");
      setShopify(shopifyInstance);
      setCartId(cartIdValue);
    };
    initialize();
  }, []); // This hook runs only on component mount

  useEffect(() => {
    const fetchData = async () => {
      if (shopify && cartId) {
        const decodedCartId = decodeURIComponent(cartId);
        let updatedCart = await shopify.getCart(decodedCartId);
        setCart(updatedCart);
      }
    };
    fetchData();
  }, [shopify, cartId, cart]); // This hook runs whenever shopify or cartId changes

  return <CartModal cart={cart} />;
}
