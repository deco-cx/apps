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
export const GetProduct = {
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
        }
      }
    }
  `,
};

export const GetCategoryUid = {
  query: gql`
    query GetCategoryUid($path: String) {
      categories(filters: { url_path: { eq: $path } }) {
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
        }
      }
    }
  `,
};

export const GetPLPItems = {
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
};
