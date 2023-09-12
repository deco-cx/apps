import { gql } from "../../../utils/graphql.ts";

// Fixme: This is to avoid typescript generation errors
// because it does not accept generating an empty schema
// TODO: Remove this once you add any other query
export const Noop = {
  query: gql`query Noop { app(id: "") { description } }`,
};
