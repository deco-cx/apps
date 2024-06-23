import { gql } from "../../../utils/graphql.ts";
//Fragments
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
          ${extraProps ? extraProps.join(`\n`) : `\n`}
        }
      }
    }
  `,
});

export const GetCompleteProduct = (
  extraProps?: Array<string>,
  useCategoriesBreadcrumb?: boolean,
) => ({
  fragments: [completeProduct, priceRange, mediaGallery],
  query: gql`
    query GetProduct(
      $search: String
      $filter: ProductAttributeFilterInput
    ) {
      products(
        search: $search
        filter: $filter
        pageSize: 1
        currentPage: 1
      ) {
        items {
          ...completeProduct
          ${extraProps ? extraProps.join(`\n`) : `\n`}
          ${
    useCategoriesBreadcrumb ? `categories { name \n url_key \n position }` : ""
  }
        }
      }
    }
  `,
});

export const GetExtraProps = (extraProps?: Array<string>) => ({
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
      sku
      ${extraProps ? extraProps.join(`\n`) : `\n`}
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
    query GetProduct(
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
          ${extraProps ? extraProps.join(`\n`) : `\n`}
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
