import { gql } from "../../../utils/graphql.ts";

export const query = gql`
mutation customerUpdate($input: CustomerInput!) {
  payload: customerUpdate(input: $input) {
    customer {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;

export interface Variables {
  input: {
    id: string;
    tags?: string[];
  };
}

export interface Data {
  payload: {
    customer: {
      id: string;
    };
  };
}
