import { gql } from "../../../utils/graphql.ts";

export const query = gql`
mutation createCart {
  payload: cartCreate {
    cart {
      id
    }
  }
}
`;

export type Variables = never;

export interface Data {
  payload: { cart: { id: string } };
}
