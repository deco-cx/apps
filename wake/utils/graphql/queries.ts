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
  parentId
  sku
  numberOfVotes
  stock
  variantName
  variantStock
  collection
  urlVideo
  similarProducts {
    alias
    image
    imageUrl
    name
  }
  promotions {
    content
    disclosureType
    id
    fullStampUrl
    stamp
    title
  }
  # parallelOptions
}
`;

const ProductVariant = gql`
fragment ProductVariant on ProductVariant {
  
        aggregatedStock
        alias
        available
        attributes {
          attributeId
          displayType
          id
          name
          type
          value
        }
        ean
        id
        images {
          fileName
          mini
          order
          print
          url
        }
        productId
        productVariantId
        productVariantName
        sku
        stock
        prices {
          discountPercentage
          discounted
          installmentPlans {
            displayName
            name
            installments {
              discount
              fees
              number
              value
            }
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
          bestInstallment {
            discount
            displayName
            fees
            name
            number
            value
          }
        }
        offers {
          name
          prices {
            installmentPlans {
              displayName
              installments {
                discount
                fees
                number
                value
              }
            }
            listPrice
            price
          }
          productVariantId
        }
        promotions {
          content
          disclosureType
          id
          fullStampUrl
          stamp
          title
        }
}`;

const SingleProductPart = gql`
fragment SingleProductPart on SingleProduct {
  mainVariant
  productName
  productId
  alias
  collection
  attributes {
    name
    type
    value
    attributeId
    displayType
    id
  }
  numberOfVotes
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
  parallelOptions
  urlVideo
  reviews {
    rating
    review
    reviewDate
    email
    customer
  }
  similarProducts {
    alias
    image
    imageUrl
    name
  }
  attributeSelections {
    selections {
      attributeId
      displayType
      name
      varyByParent
      values {
        alias
        available
        value
        selected
        printUrl
      }
    }
    canBeMatrix
    matrix {
        column {
          displayType
          name
          values {
            value
          }
        }
        data {
          available
          productVariantId
          stock
        }
        row {
          displayType
          name
          values {
            value
            printUrl
          }
        }
      }
    selectedVariant {
      ...ProductVariant
    }
    candidateVariant {
      ...ProductVariant
    }
  },
  promotions {
    content
    disclosureType
    id
    fullStampUrl
    stamp
    title
  }
 
}
`;

const SingleProduct = gql`
fragment SingleProduct on SingleProduct {
  ...SingleProductPart,
  buyTogether {
    productId
  } 
}

`;

const RestockAlertNode = gql`
  fragment RestockAlertNode on RestockAlertNode {
    email,
    name,
    productVariantId,
    requestDate
  }
`;

const NewsletterNode = gql`
  fragment NewsletterNode on NewsletterNode {
    email,
    name,
    createDate,
    updateDate
  }
`;

const ShippingQuote = gql`
  fragment ShippingQuote on ShippingQuote {
    id
    type
    name
    value
    deadline
    shippingQuoteId
    deliverySchedules {
      date
      periods {
        end
        id
        start
      }
    }
    products {
      productVariantId
      value
    }
  }
`;

export const Customer = gql`
  fragment Customer on Customer {
    id
    email
    gender
    customerId
    companyName
    customerName
    customerType
    responsibleName
    informationGroups {
      exibitionName
      name
    }
  }
`;

export const WishlistReducedProduct = gql`
  fragment WishlistReducedProduct on Product {
    productId
    productName
  }
`;

export const GetProduct = {
  fragments: [SingleProductPart, SingleProduct, ProductVariant],
  query: gql`query GetProduct($productId: Long!) { 
    product(productId: $productId) { 
      ...SingleProduct 
     
    } 
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
    gql`query GetProducts($filters: ProductExplicitFiltersInput!, $first: Int!, $sortDirection: SortDirection!, $sortKey: ProductSortKeys, $after: String) { products(filters: $filters, first: $first, sortDirection: $sortDirection, sortKey: $sortKey, after: $after) { 
      nodes { ...Product } 
      totalCount
      pageInfo{
        hasNextPage,
        endCursor,
        hasPreviousPage,
        startCursor
      }
    }}`,
};

export const Search = {
  fragments: [Product],
  query:
    gql`query Search($operation: Operation!, $query: String, $onlyMainVariant: Boolean, $minimumPrice: Decimal, $maximumPrice: Decimal , $limit: Int, $offset: Int,  $sortDirection: SortDirection, $sortKey: ProductSearchSortKeys, $filters: [ProductFilterInput]) { 
       result: search(query: $query, operation: $operation) { 
          aggregations {
            maximumPrice
            minimumPrice
            priceRanges {
              quantity
              range
            }
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
          productsByOffset(
            filters: $filters,
            limit: $limit,
            maximumPrice: $maximumPrice,
            minimumPrice: $minimumPrice,
            onlyMainVariant: $onlyMainVariant
            offset: $offset,
            sortDirection: $sortDirection,
            sortKey: $sortKey
          ) {
            items {
              ...Product
            }
            page
            pageSize
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

export const ProductRestockAlert = {
  fragments: [RestockAlertNode],
  query: gql`mutation ProductRestockAlert($input: RestockAlertInput!) { 
      productRestockAlert(input: $input) { ...RestockAlertNode }
    }`,
};

export const WishlistAddProduct = {
  fragments: [Product],
  query:
    gql`mutation WishlistAddProduct($customerAccessToken: String!, $productId: Long!) { 
      wishlistAddProduct(customerAccessToken: $customerAccessToken, productId: $productId) { ...Product }
    }`,
};

export const WishlistRemoveProduct = {
  fragments: [Product],
  query:
    gql`mutation WishlistRemoveProduct($customerAccessToken: String!, $productId: Long!) { 
      wishlistRemoveProduct(customerAccessToken: $customerAccessToken, productId: $productId) { ...Product }
    }`,
};

export const CreateNewsletterRegister = {
  fragments: [NewsletterNode],
  query: gql`mutation CreateNewsletterRegister($input: NewsletterInput!) { 
      createNewsletterRegister(input: $input) { ...NewsletterNode }
    }`,
};

export const Autocomplete = {
  fragments: [Product],
  query:
    gql`query Autocomplete($limit: Int, $query: String, $partnerAccessToken: String) { 
      autocomplete(limit: $limit, query: $query , partnerAccessToken: $partnerAccessToken ) { 
        suggestions, 
        products {
          ...Product
        }
      }
    }`,
};

export const ProductRecommendations = {
  fragments: [Product],
  query: gql`query ProductRecommendations( 
    $productId: Long!,
    $algorithm: ProductRecommendationAlgorithm!,
    $partnerAccessToken: String,
    $quantity: Int!
  ) { 
      productRecommendations(productId: $productId, algorithm: $algorithm, partnerAccessToken: $partnerAccessToken, quantity: $quantity) { 
          ...Product
      }
    }`,
};

export const ShippingQuotes = {
  fragments: [ShippingQuote],
  query:
    gql`query ShippingQuotes($cep: CEP,$checkoutId: Uuid, $productVariantId: Long,$quantity: Int = 1, $useSelectedAddress: Boolean){
    shippingQuotes(cep: $cep,checkoutId: $checkoutId,productVariantId: $productVariantId,quantity: $quantity, useSelectedAddress: $useSelectedAddress){
      ...ShippingQuote
    }
  }`,
};

export const GetUser = {
  fragments: [Customer],
  query: gql`query getUser($customerAccessToken: String){
      customer(customerAccessToken: $customerAccessToken) {
        ...Customer
    }
  }`,
};

export const GetWishlist = {
  fragments: [WishlistReducedProduct],
  query: gql`query getWislist($customerAccessToken: String){
      customer(customerAccessToken: $customerAccessToken) {
        wishlist {
          products {
          ...WishlistReducedProduct
          }
        }
    }
  }`,
};

export const GetURL = {
  query: gql`query getURL($url: String!)  {
    uri(url: $url) {
      hotsiteSubtype
      kind
      partnerSubtype
      productAlias
      productCategoriesIds
      redirectCode
      redirectUrl
    }
  }`,
};

export const CreateProductReview = {
  query:
    gql`mutation createProductReview ($email: String!, $name: String!, $productVariantId: Long!, $rating: Int!, $review: String!){
    createProductReview(input: {email: $email, name: $name, productVariantId: $productVariantId, rating: $rating, review: $review}) {
      customer
      email
      rating
      review
      reviewDate
  }}`,
};

export const SendGenericForm = {
  query:
    gql`mutation sendGenericForm ($body: Any, $file: Upload, $recaptchaToken: String){
    sendGenericForm(body: $body, file: $file, recaptchaToken: $recaptchaToken) {
      isSuccess
  }}`,
};

export const Hotsite = {
  fragments: [Product],
  query: gql`query Hotsite($url: String,
    $filters: [ProductFilterInput],
    $limit: Int,
    $maximumPrice: Decimal,
    $minimumPrice: Decimal,
    $onlyMainVariant: Boolean
    $offset: Int,
    $sortDirection: SortDirection,
    $sortKey: ProductSortKeys) {
    result: hotsite(url: $url) {
      aggregations {
        filters {
          field
          origin
          values {
            name
            quantity
          }
        }
        maximumPrice
        minimumPrice
        priceRanges {
          quantity
          range
        }
      }
      productsByOffset(
            filters: $filters,
            limit: $limit,
            maximumPrice: $maximumPrice,
            minimumPrice: $minimumPrice,
            onlyMainVariant: $onlyMainVariant
            offset: $offset,
            sortDirection: $sortDirection,
            sortKey: $sortKey
          ) {
            items {
              ...Product
            }
            page
            pageSize
            totalCount
          }
      breadcrumbs {
        link
        text
      }
      endDate
      expression
      id
      name
      pageSize
      seo {
        content
        httpEquiv
        name
        scheme
        type
      }
      sorting {
        direction
        field
      }
      startDate
      subtype
      template
      url
      hotsiteId
    }
  }
  `,
};

export const productOptions = {
  query: gql`query productOptions ($productId: Long!){
    productOptions(productId: $productId) {
      attributes {
        attributeId
        displayType
        id
        name
        type
        values {
          productVariants {
            ...ProductVariant
          }
          value
        }
      }
      id
    }
  }`,
};

export const Shop = {
  query: gql`query shop{
    shop {
      checkoutUrl
      mainUrl
      mobileCheckoutUrl
      mobileUrl
      modifiedName
      name
    }
  }`,
};
