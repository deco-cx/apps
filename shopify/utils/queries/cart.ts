import { gql } from "../../../utils/graphql.ts";
import { Fragment, fragment } from "../fragments/cart.ts";

export const query = gql`
query($id: ID!) { cart(id: $id) { ...${fragment} } }
`;

export interface Variables {
  id: string;
}

export interface Data {
  cart: Fragment;
}
