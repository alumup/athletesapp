import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "@/lib/constants";
import { isShopifyError } from "@/lib/type-guards";
import { ensureStartsWith } from "@/lib/utils";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import {
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
} from "./types";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export default class Shopify {
  storefrontToken: string;

  constructor(storefrontToken: string) {
    this.storefrontToken = storefrontToken;
  }

  async shopifyFetch<T>({
    cache = "force-cache",
    headers,
    query,
    tags,
    variables,
  }: {
    cache?: RequestCache;
    headers?: HeadersInit;
    query: string;
    tags?: string[];
    variables?: ExtractVariables<T>;
  }): Promise<{ status: number; body: T } | never> {
    try {
      const result = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": this.storefrontToken,
          ...headers,
        },
        body: JSON.stringify({
          ...(query && { query }),
          ...(variables && { variables }),
        }),
        cache,
        ...(tags && { next: { tags } }),
      });

      const body = await result.json();

      if (body.errors) {
        throw body.errors[0];
      }

      return {
        status: result.status,
        body,
      };
    } catch (e) {
      if (isShopifyError(e)) {
        throw {
          cause: e.cause?.toString() || "unknown",
          status: e.status || 500,
          message: e.message,
          query,
        };
      }

      throw {
        error: e,
        query,
      };
    }
  }

  static removeEdgesAndNodes<T>(array: Connection<T>) {
    return array.edges.map((edge) => edge?.node);
  }

  static reshapeCart(cart: ShopifyCart): Cart {
    if (!cart.cost?.totalTaxAmount) {
      cart.cost.totalTaxAmount = {
        amount: "0.0",
        currencyCode: "USD",
      };
    }

    return {
      ...cart,
      lines: Shopify.removeEdgesAndNodes(cart.lines),
    };
  }

  static reshapeCollection(
    collection: ShopifyCollection,
  ): Collection | undefined {
    if (!collection) {
      return undefined;
    }

    return {
      ...collection,
      path: `/search/${collection.handle}`,
    };
  }

  static reshapeCollections(collections: ShopifyCollection[]) {
    const reshapedCollections = [];

    for (const collection of collections) {
      if (collection) {
        const reshapedCollection = Shopify.reshapeCollection(collection);

        if (reshapedCollection) {
          reshapedCollections.push(reshapedCollection);
        }
      }
    }

    return reshapedCollections;
  }

  static reshapeImages(images: Connection<Image>, productTitle: string) {
    const flattened = Shopify.removeEdgesAndNodes(images);

    return flattened.map((image) => {
      const filename = image.url?.match(/.*\/(.*)\..*/)?.[1] || "";
      return {
        ...image,
        altText: image.altText || `${productTitle} - ${filename}`,
      };
    });
  }

  static reshapeProduct(
    product: ShopifyProduct,
    filterHiddenProducts: boolean = true,
  ) {
    if (
      !product ||
      (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
    ) {
      return undefined;
    }

    const { images, variants, ...rest } = product;

    return {
      ...rest,
      images: Shopify.removeEdgesAndNodes(images),
      variants: Shopify.removeEdgesAndNodes(variants),
    };
  }

  static reshapeProducts(products: ShopifyProduct[]) {
    const reshapedProducts = [];

    for (const product of products) {
      if (product) {
        const reshapedProduct = Shopify.reshapeProduct(product);

        if (reshapedProduct) {
          reshapedProducts.push(reshapedProduct);
        }
      }
    }

    return reshapedProducts;
  }

  async createCart(): Promise<Cart> {
    const res = await this.shopifyFetch<ShopifyCreateCartOperation>({
      query: createCartMutation,
      cache: "no-store",
    });

    return Shopify.reshapeCart(res.body.data.cartCreate.cart);
  }

  async addToCart(
    cartId: string,
    lines: { merchandiseId: string; quantity: number }[],
  ): Promise<Cart> {
    const res = await this.shopifyFetch<ShopifyAddToCartOperation>({
      query: addToCartMutation,
      variables: {
        cartId,
        lines,
      },
      cache: "no-store",
    });
    return Shopify.reshapeCart(res.body.data.cartLinesAdd.cart);
  }

  async removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
    const res = await this.shopifyFetch<ShopifyRemoveFromCartOperation>({
      query: removeFromCartMutation,
      variables: {
        cartId,
        lineIds,
      },
      cache: "no-store",
    });

    return Shopify.reshapeCart(res.body.data.cartLinesRemove.cart);
  }

  async updateCart(
    cartId: string,
    lines: { id: string; merchandiseId: string; quantity: number }[],
  ): Promise<Cart> {
    const res = await this.shopifyFetch<ShopifyUpdateCartOperation>({
      query: editCartItemsMutation,
      variables: {
        cartId,
        lines,
      },
      cache: "no-store",
    });

    return Shopify.reshapeCart(res.body.data.cartLinesUpdate.cart);
  }

  async getCart(cartId: string): Promise<Cart | undefined> {
    try {
      const res = await this.shopifyFetch<ShopifyCartOperation>({
        query: getCartQuery,
        variables: { cartId },
        cache: "no-store",
      });

      // Old carts becomes `null` when you checkout.
      if (!res.body.data.cart) {
        return undefined;
      }

      return Promise.resolve(Shopify.reshapeCart(res.body.data.cart));
    } catch (error) {
      console.error(error);
      Promise.reject(error)
      throw error; // or handle the error as you see fit
    }
  }

  async getCollection(handle: string): Promise<Collection | undefined> {
    const res = await this.shopifyFetch<ShopifyCollectionOperation>({
      query: getCollectionQuery,
      tags: [TAGS.collections],
      variables: {
        handle,
      },
    });

    return Shopify.reshapeCollection(res.body.data.collection);
  }

  async getCollectionProducts({
    collection,
    reverse,
    sortKey,
  }: {
    collection: string;
    reverse?: boolean;
    sortKey?: string;
  }): Promise<Product[]> {
    const res = await this.shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getCollectionProductsQuery,
      tags: [TAGS.collections, TAGS.products],
      variables: {
        handle: collection,
        reverse,
        sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      },
    });

    console.log("SHOPIFY COLLECTION RETURN ----->", res.body.data.collection);

    if (!res.body.data.collection) {
      console.log(`No collection found for \`${collection}\``);
      return [];
    }

    if (res.body.data.collection) {
      console.log("SHOPIFY COLLECTION RETURN ----->", res.body.data.collection);
    }

    return Shopify.reshapeProducts(
      Shopify.removeEdgesAndNodes(res.body.data.collection.products),
    );
  }

  async getCollections(): Promise<Collection[]> {
    const res = await this.shopifyFetch<ShopifyCollectionsOperation>({
      query: getCollectionsQuery,
      tags: [TAGS.collections],
    });
    const shopifyCollections = Shopify.removeEdgesAndNodes(
      res.body?.data?.collections,
    );
    const collections = [
      {
        handle: "",
        title: "All",
        description: "All products",
        seo: {
          title: "All",
          description: "All products",
        },
        path: "/search",
        updatedAt: new Date().toISOString(),
      },
      // Filter out the `hidden` collections.
      // Collections that start with `hidden-*` need to be hidden on the search page.
      ...Shopify.reshapeCollections(shopifyCollections).filter(
        (collection) => !collection.handle.startsWith("hidden"),
      ),
    ];

    return collections;
  }

  async getMenu(handle: string): Promise<Menu[]> {
    const res = await this.shopifyFetch<ShopifyMenuOperation>({
      query: getMenuQuery,
      tags: [TAGS.collections],
      variables: {
        handle,
      },
    });

    return (
      res.body?.data?.menu?.items.map(
        (item: { title: string; url: string }) => ({
          title: item.title,
          path: item.url
            .replace(domain, "")
            .replace("/collections", "/search")
            .replace("/pages", ""),
        }),
      ) || []
    );
  }

  async getPage(handle: string): Promise<Page> {
    const res = await this.shopifyFetch<ShopifyPageOperation>({
      query: getPageQuery,
      variables: { handle },
    });

    return res.body.data.pageByHandle;
  }

  async getPages(): Promise<Page[]> {
    const res = await this.shopifyFetch<ShopifyPagesOperation>({
      query: getPagesQuery,
    });

    return Shopify.removeEdgesAndNodes(res.body.data.pages);
  }

  async getProduct(handle: string): Promise<Product | undefined> {
    const res = await this.shopifyFetch<ShopifyProductOperation>({
      query: getProductQuery,
      tags: [TAGS.products],
      variables: {
        handle,
      },
    });

    return Shopify.reshapeProduct(res.body.data.product, false);
  }

  async getProductRecommendations(productId: string): Promise<Product[]> {
    const res = await this.shopifyFetch<ShopifyProductRecommendationsOperation>(
      {
        query: getProductRecommendationsQuery,
        tags: [TAGS.products],
        variables: {
          productId,
        },
      },
    );

    return Shopify.reshapeProducts(res?.body?.data?.productRecommendations);
  }

  async getProducts({
    query,
    reverse,
    sortKey,
  }: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  }): Promise<Product[]> {
    const res = await this.shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      tags: [TAGS.products],
      variables: {
        query,
        reverse,
        sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      },
    });

    return Shopify.reshapeProducts(
      Shopify.removeEdgesAndNodes(res.body.data.products),
    );
  }
}

let shopifyInstance: Shopify | undefined;

export function createShopify(storefrontToken?: string) {
  if (!shopifyInstance) {
    if (!storefrontToken) {
      throw new Error(
        "You must provide a `storefrontToken` to `createShopify()`",
      );
    }

    shopifyInstance = new Shopify(storefrontToken);
  }

  return shopifyInstance;
}
