import { gql } from "../../../utils/graphql.ts";
//TODO(@aka-sacci-ccr): Colocar itens que serao retornados

export const sortFields = gql`
  fragment sortFields on SortFields {
    default
    options {
      label
      value
    }
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

//TODO (@aka-sacci-ccr): Tag de novidade
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
