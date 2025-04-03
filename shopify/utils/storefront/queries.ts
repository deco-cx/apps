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
      ... on Video {
        alt
        sources {
          url
        }
      }
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
  metafields(identifiers: $identifiers) {
    description
    key
    namespace
    type
    value
    reference {
      ... on MediaImage {
        image {
          url
        }
      }
    }
    references(first: 250) {
      edges {
        node {
          ... on MediaImage {
            image {
              url
            }
          }
        }
      }
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
            onlineStoreUrl
            handle
          }
          price {
            amount
            currencyCode
          }
        }
      }
      discountAllocations {
        ...on CartCodeDiscountAllocation {
          code
          discountedAmount {
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
        subtotalAmount {
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
    totalTaxAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
    checkoutChargeAmount {
      amount
      currencyCode
    }
  }
  discountCodes {
    code
    applicable
  }
  discountAllocations {
    discountedAmount {
      amount
      currencyCode
    }
  }
}`;

const Customer = gql`
  fragment Customer on Customer {
    id
    email
    firstName
    lastName
  }
`;

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
  query:
    gql`query GetProduct($handle: String, $identifiers: [HasMetafieldsIdentifier!]!) {
      product(handle: $handle) { ...Product }
    }`,
};

export const ListProducts = {
  fragments: [Product, ProductVariant, Collection],
  query:
    gql`query ListProducts($first: Int, $after: String, $query: String, $identifiers: [HasMetafieldsIdentifier!]!) {
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
      $reverse: Boolean,
      $identifiers: [HasMetafieldsIdentifier!]!
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
      $filters: [ProductFilter!],
      $identifiers: [HasMetafieldsIdentifier!]!
    ){
    collection(handle: $handle) {
      handle
      description
      title
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
  query:
    gql`query productRecommendations($productId: ID!, $identifiers: [HasMetafieldsIdentifier!]!) {
    productRecommendations(productId: $productId) {
      ...Product
    }
  }`,
};

export const GetShopInfo = {
  query: gql`query GetShopInfo($identifiers: [HasMetafieldsIdentifier!]!) {
    shop {
      name
      description
      privacyPolicy {
        title
        body
      }
      refundPolicy {
        title
        body
      }
      shippingPolicy {
        title
        body
      }
      subscriptionPolicy {
        title
        body
      }
      termsOfService {
        title
        body
      }
      metafields(identifiers: $identifiers) {
        description
        key
        namespace
        type
        value
        reference {
          ... on MediaImage {
            image {
              url
            }
          }
        }
        references(first: 250) {
          edges {
            node {
              ... on MediaImage {
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  }`,
};

export const FetchCustomerInfo = {
  fragments: [Customer],
  query: gql`query FetchCustomerInfo($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      ...Customer
    }
  }`,
};

export const FetchCustomerAddresses = {
  query: gql`query FetchCustomerAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      addresses(first: 10) {
        edges {
          node {
            address1
            city
            country
            id
            province
            zip
          }
        }
      }
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

export const RegisterAccount = {
  query: gql`mutation RegisterAccount(
      $email: String!,
      $password: String!,
      $firstName: String,
      $lastName: String,
      $acceptsMarketing: Boolean = false
    ) {
    customerCreate(input: {
      email: $email,
      password: $password,
      firstName: $firstName,
      lastName: $lastName,
      acceptsMarketing: $acceptsMarketing,
    }) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }`,
};

export const UpdateCustomerInfo = {
  query: gql`mutation UpdateCustomerInfo(
      $customerAccessToken: String!, 
      $email: String,
      $firstName: String,
      $lastName: String,
      $acceptsMarketing: Boolean,
    ) {
    customerUpdate(
      customerAccessToken: $customerAccessToken,
      customer: {
        email: $email,
        firstName: $firstName,
        lastName: $lastName,
        acceptsMarketing: $acceptsMarketing,
      }
    ) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
      userErrors {
        message
      }
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

export const SignInWithEmailAndPassword = {
  query:
    gql`mutation SignInWithEmailAndPassword($email: String!, $password: String!) {
    customerAccessTokenCreate(input: { email: $email, password: $password }) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        message
      }
    }
  }`,
};

export const SendPasswordResetEmail = {
  query: gql`mutation SendPasswordResetEmail($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        message
      }
      userErrors {
        message
      }
    }
  }`,
};

export const CreateAddress = {
  query: gql`mutation CreateAddress(
    $customerAccessToken: String!,
    $address1: String!,
    $country: String!,
    $province: String!,
    $city: String!,
    $zip: String!
  ) {
    customerAddressCreate(
      customerAccessToken: $customerAccessToken,
      address: {
        address1: $address1, 
        country: $country, 
        province: $province, 
        city: $city, 
        zip: $zip
      }
    ) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }`,
};

export const UpdateAddress = {
  query: gql`mutation UpdateAddress(
    $addressId: ID!,
    $customerAccessToken: String!, 
    $address1: String!,
    $country: String!,
    $province: String!,
    $city: String!,
    $zip: String!
  ) {
    customerAddressUpdate(
      id: $addressId,
      customerAccessToken: $customerAccessToken,
      address: {
        address1: $address1, 
        country: $country, 
        province: $province, 
        city: $city, 
        zip: $zip
      }
    ) {
      customerAddress {
          id
      }
      customerUserErrors {
          code
          message
      }
      userErrors {
          message
      }
    }
  }`,
};

export const SetDefaultAddress = {
  query: gql`mutation SetDefaultAddress(
    $customerAccessToken: String!,
    $addressId: ID!
  ) {
    customerDefaultAddressUpdate(
      customerAccessToken: $customerAccessToken,
      addressId: $addressId
    ) {
      customer {
        defaultAddress {
          id
        }
      }
      customerUserErrors {
        code
        message
      }
    }
  }`,
};

export const DeleteAddress = {
  query: gql`mutation DeleteAddress(
    $customerAccessToken: String!,
    $addressId: ID!
  ) {
    customerAddressDelete(
      customerAccessToken: $customerAccessToken,
      id: $addressId
    ) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        message
      }
      userErrors {
        message
      }
    }
  }`,
};
