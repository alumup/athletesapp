"use server";

import { getAccountShopify } from "@/lib/fetchers/server";
import { cookies } from "next/headers";

export const addItem = async (
  variantId: string | undefined,
  domain: string,
): Promise<String | undefined> => {
  const shopify = await getAccountShopify(domain);

  let cartId = cookies().get("cartId")?.value;
  let cart;

  if (cartId) {
    cart = await shopify.getCart(cartId);
  }

  if (!cartId || !cart) {
    cart = await shopify.createCart();
    cartId = cart.id;
    cookies().set("cartId", cartId);
  }

  if (!variantId) {
    return "Missing product variant ID";
  }

  try {
    await shopify.addToCart(cartId, [
      { merchandiseId: variantId, quantity: 1 },
    ]);
  } catch (e) {
    return "Error adding item to cart";
  }
};

export const removeItem = async (
  lineId: string,
  domain: string,
): Promise<String | undefined> => {
  const shopify = await getAccountShopify(domain);

  const cartId = cookies().get("cartId")?.value;

  if (!cartId) {
    return "Missing cart ID";
  }
  try {
    await shopify.removeFromCart(cartId, [lineId]);
  } catch (e) {
    return "Error removing item from cart";
  }
};

export const updateItemQuantity = async ({
  lineId,
  variantId,
  quantity,
  domain,
}: {
  lineId: string;
  variantId: string;
  quantity: number;
  domain: string;
}): Promise<String | undefined> => {
  const shopify = await getAccountShopify(domain);
  const cartId = cookies().get("cartId")?.value;

  if (!cartId) {
    return "Missing cart ID";
  }
  try {
    await shopify.updateCart(cartId, [
      {
        id: lineId,
        merchandiseId: variantId,
        quantity,
      },
    ]);
  } catch (e) {
    return "Error updating item quantity";
  }
};
