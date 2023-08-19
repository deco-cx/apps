import { gql } from "../../utils/gql.ts";

export const cartFragment = gql`
fragment CartFragment on Cart {
  id
  checkoutUrl
  totalQuantity
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ...on ProductVariant {
          id
          title
          image {
            url
            altText
          }
          product {
            title
          }
          price {
            amount
            currencyCode
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount{
          amount
          currencyCode
        }
        amountPerQuantity {
          amount
          currencyCode
        }
        compareAtAmountPerQuantity {
          amount
          currencyCode
        }
      }
    }
  }
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
    checkoutChargeAmount{
      amount
      currencyCode
    }
  }
  discountCodes {
    code
    applicable
  }
  discountAllocations{
    discountedAmount {
      amount
      currencyCode
    }
  }
}`;
