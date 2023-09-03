import { gql } from "../../../utils/graphql.ts";
import {
  Fragment as CartFragment,
  fragment as cartFragment,
} from "../fragments/cart.ts";

export const query = gql`
mutation update($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  payload: cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart { ...${cartFragment} }
  }
}
`;

export interface Variables {
  cartId: string;
  lines: Array<{ id: string; quantity?: number }>;
}

export interface Data {
  payload: {
    cart: CartFragment;
  };
}
