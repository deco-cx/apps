import { fetchAPI } from "../../utils/fetch.ts";
import { Props } from "../mod.ts";
import { Cart, Product } from "../utils/types.ts";
import { gql } from "../utils/gql.ts";
import { productFragment } from "../utils/fragments/product.ts";
import { cartFragment } from "../utils/fragments/cart.ts";

export const createClient = (
  { storeName, storefrontAccessToken }: Props,
) => {
  const graphql = async <T>(
    query: string,
    fragments: string[] = [],
    variables: Record<string, unknown> = {},
  ) => {
    const finalQuery = [query, ...fragments].join("\n");
    const { data, errors } = await fetchAPI<{ data?: T; errors: unknown[] }>(
      `https://${storeName}.myshopify.com/api/2022-10/graphql.json`,
      {
        method: "POST",
        body: JSON.stringify({
          query: finalQuery,
          variables,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
      },
    );

    if (Array.isArray(errors) && errors.length > 0) {
      console.error(Deno.inspect(errors, { depth: 100, colors: true }));

      throw new Error(
        `Error while running query:\n${finalQuery}\n\n${
          JSON.stringify(variables)
        }`,
      );
    }

    return data;
  };

  const product = (handle: string) =>
    graphql<{ product: Product }>(
      gql`
        query GetProduct($handle: String) {
          product(handle: $handle) {
            ...ProductFragment
          }
        }
      `,
      [productFragment],
      { handle },
    );

  const products = (
    options: { first: number; after?: string; query?: string },
  ) =>
    graphql<
      { products: { nodes: Product[]; pageInfo: { hasNextPage: boolean } } }
    >(
      gql`
          query GetProducts($first: Int, $after: String, $query: String) {
            products(first: $first, after: $after, query: $query) {
              pageInfo {
                hasNextPage
              }
              nodes {
                ...ProductFragment
              }
            }
          }
        `,
      [productFragment],
      options,
    );

  const createCart = () =>
    graphql<{
      payload: {
        cart: {
          id: string;
        };
      };
    }>(gql`
      mutation createCart {
        payload: cartCreate {
          cart {
            id
          }
        }
      }`);

  const getCart = (id: string) =>
    graphql<Cart>(
      gql`
    query($id: ID!) { cart(id: $id) { ...CartFragment } }
  `,
      [cartFragment],
      { id },
    );

  const addItem = (variables: {
    cartId: string;
    lines: Array<{
      merchandiseId: string;
      attributes?: Array<{ key: string; value: string }>;
      quantity?: number;
      sellingPlanId?: string;
    }>;
  }) =>
    graphql<{ cartLinesAdd: Cart }>(
      gql`
    mutation add($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFragment }
      }
    }`,
      [cartFragment],
      variables,
    );

  const addCoupon = (variables: {
    cartId: string;
    discountCodes: string[];
  }) =>
    graphql<{ cartDiscountCodesUpdate: Cart }>(
      gql`
      mutation addCoupon($cartId: ID!, $discountCodes: [String!]!) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart { ...CartFragment }
        userErrors {
          field
          message
        }
      }
    }
  `,
      [cartFragment],
      variables,
    );

  const updateItems = (variables: {
    cartId: string;
    lines: Array<{
      id: string;
      quantity?: number;
    }>;
  }) =>
    graphql<{ cartLinesUpdate: Cart }>(
      gql`
    mutation update($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFragment }
      }
    }
  `,
      [cartFragment],
      variables,
    );

  return {
    product,
    products,
    cart: {
      create: createCart,
      get: getCart,
      addItem,
      addCoupon,
      updateItems,
    },
    graphql,
  };
};
