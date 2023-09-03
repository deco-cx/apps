import { gql } from "../../../utils/graphql.ts";
import { Fragment as Product, fragment } from "../fragments/product.ts";

export const query = gql`
query GetProduct($handle: String) {
  product(handle: $handle) { ...${fragment} }
}
`;

export interface Variables {
  handle: string;
}

export interface Data {
  product: Product;
}
