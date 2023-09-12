import { gql } from "../../../utils/graphql.ts";

const Checkout = gql`
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

const Product = gql`
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

const SingleProduct = gql`
fragment SingleProduct on SingleProduct {
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
  breadcrumbs {
    text
    link
  }
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
  reviews {
    rating
    review
    reviewDate
    email
    customer
  }
  seller {
    name
  }
  seo {
    name
    scheme
    type
    httpEquiv
    content
  }
  sku
  stock
  variantName
}
`;

export const GetProduct = {
  fragments: [SingleProduct],
  query: gql`query GetProduct($productId: Long!) { 
    product(productId: $productId) { ...SingleProduct } 
  }`,
};

export const GetCart = {
  fragments: [Checkout],
  query: gql`query GetCart($checkoutId: String!) { 
    checkout(checkoutId: $checkoutId) { ...Checkout } 
  }`,
};

export const CreateCart = {
  fragments: [Checkout],
  query: gql`mutation CreateCart { checkout: createCheckout { ...Checkout } }`,
};

export const GetProducts = {
  fragments: [Product],
  query:
    gql`query GetProducts($filters: ProductExplicitFiltersInput!, $first: Int!, $sortDirection: SortDirection!, $sortKey: ProductSortKeys) { products(filters: $filters, first: $first, sortDirection: $sortDirection, sortKey: $sortKey) { nodes { ...Product } }}`,
};

export const Search = {
  fragments: [Product],
  query:
    gql`query Search($operation: Operation!, $query: String, $first: Int!, $sortDirection: SortDirection, $sortKey: ProductSearchSortKeys, $filters: [ProductFilterInput]) { 
        search(query: $query, operation: $operation) { 
          aggregations {
            filters {
              field
              origin
              values {
                quantity
                name
              }
            }
          }
          breadcrumbs {
            link
            text
          }
          forbiddenTerm {
            text
            suggested
          }
          pageSize
          redirectUrl
          searchTime
          products(first: $first, sortDirection: $sortDirection, sortKey: $sortKey, filters: $filters) {
            nodes {
              ...Product
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            totalCount
          }
        } 
      }`,
};

export const AddCoupon = {
  fragments: [Checkout],
  query: gql`mutation AddCoupon($checkoutId: Uuid!, $coupon: String!) {
    checkout: checkoutAddCoupon(
      checkoutId: $checkoutId
      coupon: $coupon
    ) { ...Checkout }
  }`,
};

export const AddItemToCart = {
  fragments: [Checkout],
  query: gql`mutation AddItemToCart($input: CheckoutProductInput!) { 
    checkout: checkoutAddProduct(input: $input) { ...Checkout }
  }`,
};

export const RemoveCoupon = {
  fragments: [Checkout],
  query: gql`mutation RemoveCoupon($checkoutId: Uuid!) {
    checkout: checkoutRemoveCoupon(checkoutId: $checkoutId) {
      ...Checkout
    }
  }`,
};

export const RemoveItemFromCart = {
  fragments: [Checkout],
  query: gql`mutation RemoveItemFromCart($input: CheckoutProductInput!) { 
      checkout: checkoutRemoveProduct(input: $input) { ...Checkout }
    }`,
};
