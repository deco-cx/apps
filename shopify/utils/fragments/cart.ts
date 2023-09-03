import { gql } from "../../../utils/graphql.ts";
import type { Image, Money } from "../types.ts";

export interface Item {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
    };
    image: Image;
    price: Money;
  };
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
    amountPerQuantity: Money;
    compareAtAmountPerQuantity: Money;
  };
}

export interface Fragment {
  id: string;
  lines?: {
    nodes: Item[];
  };
  checkoutUrl?: string;
  cost?: {
    subtotalAmount: Money;
    totalAmount: Money;
    checkoutChargeAmount: Money;
  };
  discountCodes?: {
    code: string;
    applicable: boolean;
  }[];
  discountAllocations?: {
    discountedAmount: Money;
  };
}

export const fragment = gql`on Cart {
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
