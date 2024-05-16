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

export const simpleProduct = gql`
fragment simpleProducts on ProductInterface {
    name
    sku
  }
`;

export const GetProduct = {
  fragments: [sortFields],
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
        total_count
        items {
          name
          price_range {
            minimum_price {
              regular_price {
                value
                currency
              }
            }
          }
        }
        page_info {
          page_size
          current_page
        }
        sort_fields {
          ...sortFields
        }
      }
    }
  `,
};
