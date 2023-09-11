import { gql } from "../../../../utils/graphql.ts";

export const fragment = gql`
fragment Checkout on Checkout {
  checkoutId
  shippingFee
  subtotal
  total
  completed
  coupon
  products {
    imageUrl
    brand
    ajustedPrice
    listPrice
    price
    name
    productId
    productVariantId
    quantity
    sku
    url
  }
}
`;
