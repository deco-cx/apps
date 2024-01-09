import { gql } from "../../../utils/graphql.ts";

const ProductVariant = gql`
fragment ProductVariant on ProductVariant {
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

const Collection = gql`
fragment Collection on Collection {
  description
  descriptionHtml
  handle
  id
  image {
    altText
    url
  }
  title
  updatedAt
}`;

const Product = gql`
fragment Product on Product {
  availableForSale
  createdAt
  description
  descriptionHtml
  featuredImage {
    altText
    url
  }
  handle
  id
  images(first: 10) {
    nodes {
      altText
      url
    }
  }
  isGiftCard
  media(first: 10) {
    nodes {
      alt
      previewImage {
        altText
        url
      }
      mediaContentType
    }
  }
  onlineStoreUrl
  options {
    name
    values
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  productType
  publishedAt
  requiresSellingPlan
  seo {
    title
    description
  }
  tags
  title
  totalInventory
  updatedAt
  variants(first: 250) {
    nodes {
      ...ProductVariant
    }
  }
  vendor
  collections(first: 250) {
    nodes {
      ...Collection
    }
  }
}
`;

const Filter = gql`
fragment Filter on Filter{
  id
  label
  type
  values {
    count
    id
    input
    label
  }
}
`;

const Cart = gql`
fragment Cart on Cart {
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

export const CreateCart = {
  query: gql`mutation CreateCart {
  payload: cartCreate { 
    cart { id } 
  }
}`,
};

export const GetCart = {
  fragments: [Cart],
  query: gql`query GetCart($id: ID!) { cart(id: $id) { ...Cart } }`,
};

export const GetProduct = {
  fragments: [Product, ProductVariant, Collection],
  query: gql`query GetProduct($handle: String) {
    product(handle: $handle) { ...Product }
  }`,
};

export const ListProducts = {
  fragments: [Product, ProductVariant, Collection],
  query: gql`query ListProducts($first: Int, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      nodes {
        ...Product 
      }
    }
  }`,
};

export const SearchProducts = {
  fragments: [Product, ProductVariant, Filter, Collection],
  query: gql`query searchWithFilters(
      $first: Int, 
      $last: Int, 
      $after: String, 
      $before: String,  
      $query: String!, 
      $productFilters: [ProductFilter!]
      $sortKey: SearchSortKeys, 
      $reverse: Boolean
     ){
    search(
      first: $first, 
      last: $last, 
      after: $after, 
      before: $before, 
      query: $query, 
      productFilters: $productFilters, 
      types: PRODUCT, 
      sortKey: $sortKey,
      reverse: $reverse,
    ){
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      productFilters {
        ...Filter
      }
      nodes {
        ...Product
      }
    }
  }`,
};

export const ProductsByCollection = {
  fragments: [Product, ProductVariant, Collection, Filter],
  query: gql`query AllProducts(
      $first: Int, 
      $last: Int, 
      $after: String, 
      $before: String, 
      $handle: String,
      $sortKey: ProductCollectionSortKeys, 
      $reverse: Boolean, 
      $filters: [ProductFilter!]
    ){
    collection(handle: $handle) {
      handle
      products(
        first: $first, 
        last: $last, 
        after: $after, 
        before: $before, 
        sortKey: $sortKey, 
        reverse: $reverse, 
        filters: $filters
      ){
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        filters {
          ...Filter
        }
        nodes {
          ...Product
        }
      }
    }
  }`,
};

export const ProductRecommendations = {
  fragments: [Product, ProductVariant, Collection],
  query: gql`query productRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...Product
    }
  }`,
};

export const AddItemToCart = {
  fragments: [Cart],
  query: gql`mutation AddItemToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    payload: cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
    }
  }`,
};

export const AddCoupon = {
  fragments: [Cart],
  query: gql`mutation AddCoupon($cartId: ID!, $discountCodes: [String!]!) {
    payload: cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { ...Cart }
      userErrors {
        field
        message
      }
    }
  }`,
};

export const UpdateItems = {
  fragments: [Cart],
  query:
    gql`mutation UpdateItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      payload: cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...Cart }
      }
    }`,
};
