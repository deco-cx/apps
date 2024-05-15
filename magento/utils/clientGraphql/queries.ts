import { gql } from "../../../utils/graphql.ts";
//TODO: revisar itens que devem ser retornados - quem sabe separar os fragments?
export const GetProduct = {
    fragments: [],
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
            default
            options {
              label
              value
            }
          }
        }
      }
    `,
  };
  