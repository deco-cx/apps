import { gql } from "../../../utils/graphql.ts";
import {
  Image,
  Price,
  SelectedOption,
  UnitPriceMeasurement,
} from "../types.ts";

export interface Fragment {
  availableForSale: boolean;
  barcode: string;
  compareAtPrice: Price | null;
  currentlyNotInStock: boolean;
  id: string;
  image: Image;
  price: Price;
  quantityAvailable: number;
  requiresShipping: boolean;
  selectedOptions: SelectedOption[];
  sku: string;
  title: string;
  unitPrice: null;
  unitPriceMeasurement: UnitPriceMeasurement;
  weight: number;
  weightUnit: string;
}

export const fragment = gql`on ProductVariant {
  availableForSale
  barcode
  compareAtPrice {
    amount
    currencyCode
  }
  currentlyNotInStock
  id
  image {
    altText
    url
  }
  price {
    amount
    currencyCode
  }
  quantityAvailable
  requiresShipping
  selectedOptions {
    name
    value
  }
  sku
  title
  unitPrice {
    amount
    currencyCode
  }
  unitPriceMeasurement {
    measuredType
    quantityValue
    referenceUnit
    quantityUnit
  }
  weight
  weightUnit
}
`;
