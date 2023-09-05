import { gql } from "../../../utils/graphql.ts";
import {
  Fragment as CartFragment,
  fragment as cartFragment,
} from "../fragments/cart.ts";

export const query = gql`
mutation addCoupon($cartId: ID!, $discountCodes: [String!]!) {
  payload: cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
    cart { ...${cartFragment} }
    userErrors {
      field
      message
    }
  }
}
`;

export interface Variables {
  cartId: string;
  discountCodes: string[];
}

export interface Data {
  payload: { cart: CartFragment };
}
