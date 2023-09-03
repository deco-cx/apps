import { gql } from "../../../utils/graphql.ts";
import { Fragment as Product, fragment } from "../fragments/product.ts";

export const query = gql`
query GetProducts($first: Int, $after: String, $query: String) {
  products(first: $first, after: $after, query: $query) {
    pageInfo {
      hasNextPage
    }
    nodes {
      ...${fragment}
    }
  }
}
`;

export interface Variables {
  first: number;
  query: string;
}

export interface Data {
  products: {
    pageInfo: { hasNextPage: boolean };
    nodes: Product[];
  };
}
