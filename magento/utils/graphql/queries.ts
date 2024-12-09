import { gql } from "../../../utils/graphql.ts";

//Fragments

export const cart = gql`
  fragment cart on Cart {
    id
    email
    billing_address {
      city
      country {
        code
        label
      }
      firstname
      lastname
      postcode
      region {
        code
        label
      }
      street
      telephone
    }
    shipping_addresses {
      firstname
      lastname
      street
      city
      region {
        code
        label
      }
      country {
        code
        label
      }
      telephone
      available_shipping_methods {
        amount {
          currency
          value
        }
        available
        carrier_code
        carrier_title
        error_message
        method_code
        method_title
        price_excl_tax {
          value
          currency
        }
        price_incl_tax {
          value
          currency
        }
      }
      selected_shipping_method {
        amount {
          value
          currency
        }
        carrier_code
        carrier_title
        method_code
        method_title
      }
    }
    available_payment_methods {
      code
      title
    }
    selected_payment_method {
      code
      title
    }
    applied_coupons {
      code
    }
    prices {
      grand_total {
        value
        currency
      }
    }
    total_quantity
    items {
      id
      quantity

      product {
        name
        sku
        media_gallery {
          ...mediaGallery
        }
        image {
          ...mediaGallery
        }
      }
      errors {
        code
        message
      }
      uid
      prices {
        price {
          value
          currency
        }
      }
    }
  }
`;

export const simpleProduct = gql`
  fragment simpleProduct on ProductInterface {
    name
    sku
    canonical_url
    url_key
    uid
    media_gallery {
      ...mediaGallery
    }
    price_range {
      ...priceRange
    }
    stock_status
    only_x_left_in_stock
  }
`;

export const completeProduct = gql`
  fragment completeProduct on ProductInterface {
    attribute_set_id
    canonical_url
    category_ids
    como_usar__phebo
    country_of_manufacture
    created_at
    description
    gift_message_available
    google_product_category
    id
    media_gallery {
      ...mediaGallery
    }
    meta_description
    meta_keyword
    meta_title
    name
    new_from_date
    new_to_date
    only_x_left_in_stock
    options_container
    price_range {
      ...priceRange
    }
    short_description {
      html
    }
    sku
    special_from_date
    special_price
    special_to_date
    staged
    stock_status
    __typename
    uid
    updated_at
    url_key
    url_path
    url_suffix
  }
`;

export const priceRange = gql`
  fragment priceRange on PriceRange {
    maximum_price {
      discount {
        amount_off
        percent_off
      }
      final_price {
        currency
        value
      }
      regular_price {
        currency
        value
      }
    }
    minimum_price {
      discount {
        amount_off
        percent_off
      }
      final_price {
        currency
        value
      }
      regular_price {
        currency
        value
      }
    }
  }
`;

export const mediaGallery = gql`
  fragment mediaGallery on MediaGalleryInterface {
    disabled
    label
    position
    url
  }
`;

export const sortFields = gql`
  fragment sortFields on SortFields {
    default
    options {
      label
      value
    }
  }
`;

export const aggregations = gql`
  fragment aggregations on Aggregation {
    attribute_code
    count
    label
    options {
      count
      label
      value
    }
    position
  }
`;

export const pageInfo = gql`
  fragment pageInfo on SearchResultPageInfo {
    current_page
    page_size
    total_pages
  }
`;

//Queries
export const GetProduct = (extraProps?: Array<string>) => ({
  fragments: [simpleProduct, priceRange, mediaGallery],
  query: gql`
    query GetProduct(
      $search: String
      $filter: ProductAttributeFilterInput
      $sort: ProductAttributeSortInput
      $pageSize: Int
      $currentPage: Int
    ) {
      products(
        search: $search
        filter: $filter
        sort: $sort
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        items {
          ...simpleProduct
          ${extraProps ? extraProps.join("\n") : "\n"}
        }
      }
    }
  `,
});

export const GetCompleteProduct = (
  extraProps?: Array<string>,
  isBreadcrumbProductName?: boolean,
) => ({
  fragments: [completeProduct, priceRange, mediaGallery],
  query: gql`
    query GetCompleteProduct(
      $search: String
      $filter: ProductAttributeFilterInput
    ) {
      products(search: $search, filter: $filter, pageSize: 1, currentPage: 1) {
        items {
          ...completeProduct
          ${extraProps ? extraProps.join("\n") : "\n"}
         
        }
      }
    }
  `,
});

export const GetExtraProps = (extraProps?: Array<string>) => ({
  query: gql`
    query GetProductExtraProps(
      $search: String
      $filter: ProductAttributeFilterInput
      $sort: ProductAttributeSortInput
      $pageSize: Int
      $currentPage: Int
    ) {
      products(
        search: $search
        filter: $filter
        sort: $sort
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        items {
          sku
          ${extraProps ? extraProps.join("\n") : "\n"}
        }
      }
    }
  `,
});

export const GetCategoryUid = {
  query: gql`
    query GetCategoryUid($path: String) {
      categories(filters: { url_key: { eq: $path } }) {
        items {
          uid
          name
          url_key
          url_path
          breadcrumbs {
            category_level
            category_name
            category_uid
            category_url_key
            category_url_path
          }
          image
          meta_title
          meta_description
          description
        }
      }
    }
  `,
};

export const GetPLPItems = (extraProps?: Array<string>) => ({
  fragments: [
    simpleProduct,
    priceRange,
    mediaGallery,
    sortFields,
    aggregations,
    pageInfo,
  ],
  query: gql`
    query GetProducts(
      $filter: ProductAttributeFilterInput
      $sort: ProductAttributeSortInput
      $pageSize: Int
      $currentPage: Int
    ) {
      products(
        filter: $filter
        sort: $sort
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        total_count
        items {
          ...simpleProduct
          ${extraProps ? extraProps.join("\n") : "\n"}
        }
        sort_fields {
          ...sortFields
        }
        page_info {
          ...pageInfo
        }
        aggregations {
          ...aggregations
        }
      }
    }
  `,
});

export const GetProductImages = {
  fragments: [mediaGallery],
  query: gql`
    query GetProductImages(
      $filter: ProductAttributeFilterInput
      $pageSize: Int
    ) {
      products(filter: $filter, pageSize: $pageSize, currentPage: 1) {
        items {
          name
          sku
          url_key
          media_gallery {
            ...mediaGallery
          }
        }
      }
    }
  `,
};

export const GetCart = {
  fragments: [cart, mediaGallery],
  query: gql`
    query GetCart($cart_id: String!) {
      cart(cart_id: $cart_id) {
        ...cart
      }
    }
  `,
};

export const CreateGuestCartMutation = {
  query: gql`
    mutation CreateGuestCart {
      createEmptyCart
    }
  `,
};

export const AddProductsToCart = {
  fragments: [cart, mediaGallery],
  query: gql`
    mutation AddProductsToCart(
      $cartId: String!
      $cartItems: [CartItemInput!]!
    ) {
      addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
        cart {
          ...cart
        }
      }
    }
  `,
};

export const RemoveItemFromCart = {
  fragments: [cart, mediaGallery],
  query: gql`
    mutation RemoveItemFromCart($cartId: String!, $itemId: String!) {
      removeItemFromCart(input: { cart_id: $cartId, item_id: $itemId }) {
        cart {
          ...cart
        }
      }
    }
  `,
};

export const ApplyCouponToCart = {
  fragments: [cart, mediaGallery],
  query: gql`
    mutation ApplyCouponToCart($cartId: String!, $couponCode: String!) {
      applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
        cart {
          ...cart
        }
      }
    }
  `,
};

export const RemoveCouponFromCart = {
  fragments: [cart, mediaGallery],
  query: gql`
    mutation RemoveCouponFromCart($cartId: String!) {
      removeCouponFromCart(input: { cart_id: $cartId }) {
        cart {
          ...cart
        }
      }
    }
  `,
};

export const UpdateCartItems = {
  fragments: [cart, mediaGallery],
  query: gql`
    mutation UpdateCartItems($cartId: String!, $cartItems: [CartItemInput!]!) {
      updateCartItems(input: { cart_id: $cartId, cart_items: $cartItems }) {
        cart {
          ...cart
        }
      }
    }
  `,
};
