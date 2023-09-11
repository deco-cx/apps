import { gql } from "../../../utils/graphql.ts";

export const query = gql`
mutation customerCreate($input: CustomerInput!) {
  payload: customerCreate(input: $input) {
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
    email: string;
    emailMarketingConsent?: {
      consentUpdatedAt?: string;
      marketingOptInLevel?: string;
      marketingState: string;
    };
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
