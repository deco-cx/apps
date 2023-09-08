import { gql } from "../../../utils/graphql.ts";

export const query = gql`
mutation draftOrderCalculate($input: DraftOrderInput!) {
  payload: draftOrderCalculate(input: $input) {
    calculatedDraftOrder {
        availableShippingRates {
            title
            handle
            price {
              amount
            }
        }
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
    lineItems: {
        variantId: string;
        quantity: number;
    }[];
    shippingAddress: {
        zip: string;
        countryCode: string;
        province: string;
    }
  };
}

export interface Data {
  payload: {
    calculatedDraftOrder: {
        availableShippingRates: {
            title : string;
            handle: string;
            price :{
              amount : string
            }
        }[]
    };
  };
}
