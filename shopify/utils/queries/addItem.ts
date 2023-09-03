import { gql } from "../../../utils/graphql.ts";
import {
  Fragment as CartFragment,
  fragment as cartFragment,
} from "../fragments/cart.ts";

export const query = gql`
mutation add($cartId: ID!, $lines: [CartLineInput!]!) {
  payload: cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { ...${cartFragment} }
  }
}
`;

export interface Variables {
  cartId: string;
  lines: {
    merchandiseId: string;
    attributes?: Array<{ key: string; value: string }>;
    quantity?: number;
    sellingPlanId?: string;
  };
}

export interface Data {
  payload: {
    cart: CartFragment;
  };
}
