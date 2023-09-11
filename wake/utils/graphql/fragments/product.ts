import { gql } from "../../../../utils/graphql.ts";

export const fragment = gql`
fragment Product on Product {
  mainVariant
  productName
  productId
  alias
  attributes {
    value
    name
  }
  productCategories {
    name
    url
    hierarchy
    main
    googleCategories
  }
  informations {
    title
    value
    type
  }
  available
  averageRating
  condition
  createdAt
  ean
  id
  images {
    url
    fileName
    print
  }
  minimumOrderQuantity
  prices {
    bestInstallment {
      discount
      displayName
      fees
      name
      number
      value
    }
    discountPercentage
    discounted
    installmentPlans {
      displayName
      installments {
        discount
        fees
        number
        value
      }
      name
    }
    listPrice
    multiplicationFactor
    price
    priceTables {
      discountPercentage
      id
      listPrice
      price
    }
    wholesalePrices {
      price
      quantity
    }
  }
  productBrand {
    fullUrlLogo
    logoUrl
    name
    alias
  }
  productVariantId
  seller {
    name
  }
  sku
  stock
  variantName
}
`;
