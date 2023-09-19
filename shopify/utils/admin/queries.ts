import { gql } from "../../../utils/graphql.ts";

// Fixme: This is to avoid typescript generation errors
// because it does not accept generating an empty schema
// TODO: Remove this once you add any other query
export const Noop = {
  query: gql`query Noop { app(id: "") { description } }`,
};

export const draftOrderCalculate = {
  query: gql` mutation draftOrderCalculate($input: DraftOrderInput!) {
    calculatedDraftOrder: draftOrderCalculate(input: $input) {
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
  `,
};
