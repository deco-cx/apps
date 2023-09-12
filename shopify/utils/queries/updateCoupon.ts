import { gql } from "../../../utils/graphql.ts";
import {
  Fragment as CartFragment
} from "../fragments/cart.ts";

export const query = gql`
mutation addCoupon($cartId: ID!, $discountCodes: [String!]!) {
  payload: cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
    cart { ...Cart }
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
