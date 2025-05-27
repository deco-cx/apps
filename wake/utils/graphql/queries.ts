import { gql } from "../../../utils/graphql.ts";

const Checkout = gql`
fragment Checkout on Checkout {
	checkoutId
	shippingFee
	subtotal
	total
	completed
	coupon
  customer {
    customerId
  }
	products {
		imageUrl
		brand
		ajustedPrice
		listPrice
    totalListPrice
    totalAdjustedPrice
    seller {
      sellerName
      distributionCenterId
    }
    productAttributes {
        name
        type
        value
      }
    adjustments {
        observation
        type
        value
      }
		price
		name
		productId
		productVariantId
		quantity
		sku
		url
    category
    kit
    gift
    subscription {
        availableSubscriptions {
          name
          recurringDays
          recurringTypeId
          selected
          subscriptionGroupDiscount
          subscriptionGroupId
        }
        selected {
          selected
          name
          recurringDays
          recurringTypeId
          subscriptionGroupDiscount
          subscriptionGroupId
        }
      }
		customization {
			availableCustomizations {
				cost
				customizationId
				groupName
				id
				maxLength
				name
				order
				type
				values
			}
			id
			values {
				cost
				name
				value
			}
		}
    attributeSelections {
        selectedVariant {
          id
          alias
          available
          images {
            fileName
            url
          }
          prices {
            listPrice
            price
            discountPercentage
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
            bestInstallment {
              name
              displayName
              discount
              fees
              number
              value
            }
            wholesalePrices {
              price
              quantity
            }
          }
          productId
          productVariantId
          stock
        }
        selections {
          attributeId
          displayType
          name
          varyByParent
          values {
            alias
            available
            printUrl
            selected
            value
          }
        }
      }
	}
	selectedAddress {
    addressNumber
    cep
    city
    complement
    id
    neighborhood
    referencePoint
    state
    street
  }
	selectedShipping {
		deadline
		deadlineInHours
		deliverySchedule {
			date
			endDateTime
			endTime
			startDateTime
			startTime
		}
		name
		shippingQuoteId
		type
		value
	}
	selectedPaymentMethod {
		html
		id
		installments {
			adjustment
			number
			total
			value
		}
		paymentMethodId
		scripts
		selectedInstallment {
			adjustment
			number
			total
			value
		}
		suggestedCards {
			brand
			key
			name
			number
		}
	}
	orders {
		adjustments {
			name
			type
			value
		}
		date
		delivery {
			address {
				address
				cep
				city
				complement
				isPickupStore
				name
				neighborhood
				pickupStoreText
			}
			cost
			deliveryTime
			deliveryTimeInHours
			name
		}
		discountValue
		dispatchTimeText
		interestValue
		orderId
		orderStatus
		payment {
			card {
				brand
				cardInterest
				installments
				name
				number
			}
			invoice {
				digitableLine
				paymentLink
			}
			name
			pix {
				qrCode
				qrCodeExpirationDate
				qrCodeUrl
			}
		}
		products {
			adjustments {
				additionalInformation
				name
				type
				value
			}
			attributes {
				name
				value
			}
			imageUrl
			name
			productVariantId
			quantity
			unitValue
			value
		}
		shippingValue
		totalValue
    
	}
  kits {
      kitId
      kitGroupId
      alias
      imageUrl
      listPrice
      price
      totalListPrice
      totalAdjustedPrice
      name
      quantity
      products {
        productId
        productVariantId
        imageUrl
        name
        url
        quantity
        productAttributes {
          name
          value
        }
      }
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
    id
    type
    value
    name
  }
  productCategories {
    id
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

const BuyList = gql`
fragment BuyList on BuyList {
 
      mainVariant
  productName
  productId
  alias
  collection
  kit
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
    id
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
  },
  buyTogether {
    productId
  } 
  promotions {
    content
    disclosureType
    id
    fullStampUrl
    stamp
    title
  }
      alias
    buyListId
    kit
    available
    variantName
    buyListProducts {
      productId
      quantity
      includeSameParent
    }
    images{
      url
      fileName
      print
    }
    informations{
      id
      title
      type
      value
    }
    promotions{
      content
      id
      stamp
      fullStampUrl
      title
      disclosureType
    }
    productName
    prices {
      listPrice
      price
      discountPercentage
      installmentPlans{
          displayName
          name
          installments{
            discount
            fees
            number
            value
          }
      }
      bestInstallment {
        name
        displayName
        discount
        fees
        number
        value
      }
    }
    
}
`;

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
    id
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
  attributeSelections(includeParentIdVariants: $includeParentIdVariants) {
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
  query:
    gql`query GetProduct($productId: Long!, $includeParentIdVariants: Boolean, $partnerAccessToken: String) { 
    product(productId: $productId , partnerAccessToken: $partnerAccessToken) { 
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
    gql`query GetProducts($filters: ProductExplicitFiltersInput!, $first: Int!, $sortDirection: SortDirection!, $sortKey: ProductSortKeys, $after: String, $partnerAccessToken: String) { products(filters: $filters, first: $first, sortDirection: $sortDirection, sortKey: $sortKey, after: $after, partnerAccessToken: $partnerAccessToken) { 
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
    gql`query Search($operation: Operation!, $query: String, $onlyMainVariant: Boolean, $minimumPrice: Decimal, $maximumPrice: Decimal , $limit: Int, $offset: Int,  $sortDirection: SortDirection, $sortKey: ProductSearchSortKeys, $filters: [ProductFilterInput], $partnerAccessToken: String) { 
       result: search(query: $query, operation: $operation, partnerAccessToken: $partnerAccessToken) { 
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
  query: gql`query getWishlist($customerAccessToken: String){
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
    $sortKey: ProductSortKeys,
    $partnerAccessToken: String) {
    result: hotsite(url: $url,  partnerAccessToken: $partnerAccessToken) {
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

export const GetBuyList = {
  fragments: [BuyList],
  query: gql`query BuyList($id: Long!,  $partnerAccessToken: String) {
     buyList(id: $id,  partnerAccessToken: $partnerAccessToken){
      ...BuyList
     }
  }`,
};

export const AddKit = {
  fragments: [Checkout],
  query:
    gql`mutation AddKit($input: CheckoutKitInput!, $customerAccessToken: String, $recaptchaToken: String) {
   checkout: checkoutAddKit(input: $input, customerAccessToken: $customerAccessToken, recaptchaToken: $recaptchaToken) {
      ...Checkout
    }
  }`,
};

export const RemoveKit = {
  fragments: [Checkout],
  query:
    gql`mutation RemoveKit($input: CheckoutKitInput!, $customerAccessToken: String, $recaptchaToken: String) {
    checkout: checkoutRemoveKit(input: $input, customerAccessToken: $customerAccessToken, recaptchaToken: $recaptchaToken) {
      ...Checkout
    }
  }`,
};

export const GetPartners = {
  query:
    gql`query GetPartners($first: Int,$last: Int,$names: [String],$priceTableIds: [Int!],$sortDirection: SortDirection! = ASC,$sortKey: PartnerSortKeys! = ID,$before: String,$alias: [String],$after: String) {
    partners(first:$first,last:$last,names:$names,priceTableIds:$priceTableIds,sortDirection:$sortDirection,sortKey:$sortKey ,before:$before,alias:$alias,after:$after){
    edges{
      node{
        partnerId
        priceTableId
        portfolioId
        type
        startDate
        endDate
        name
        alias
        fullUrlLogo
        origin
        partnerAccessToken
      }
    }
  }
  }`,
};

export const CheckoutPartnerAssociate = {
  fragments: [Checkout],
  query:
    gql`mutation CheckoutPartnerAssociate($checkoutId: Uuid!,$customerAccessToken: String, $partnerAccessToken: String!){
    checkout: checkoutPartnerAssociate(checkoutId: $checkoutId ,customerAccessToken: $customerAccessToken ,partnerAccessToken: $partnerAccessToken ){
      ...Checkout
    }
  }`,
};

export const CheckoutPartnerDisassociate = {
  fragments: [Checkout],
  query:
    gql`mutation CheckoutPartnerDisassociate($checkoutId: Uuid!, $customerAccessToken: String){
    checkout: checkoutPartnerDisassociate(checkoutId: $checkoutId , customerAccessToken: $customerAccessToken ){
      ...Checkout
    }
  }`,
};
