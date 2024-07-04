// deno-lint-ignore-file no-explicit-any
import { createHttpClient, HttpClientOptions } from "./http.ts";

interface GraphqlClientOptions extends Omit<HttpClientOptions, "base"> {
  endpoint: string;
}

interface GraphQLResponse<D> {
  data: D;
  errors: unknown[];
}

type GraphQLAPI<D = unknown> = Record<
  string,
  {
    response: GraphQLResponse<D>;
    body: {
      query: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    };
  }
>;

export const gql = (query: TemplateStringsArray, ...fragments: string[]) =>
  query.reduce((a, c, i) => `${a}${fragments[i - 1]}${c}`);

export const createGraphqlClient = (
  { endpoint, ...rest }: GraphqlClientOptions,
) => {
  const url = new URL(endpoint);
  const key = `POST ${url.pathname}`;

  const defaultHeaders = new Headers(rest.headers);
  defaultHeaders.set("content-type", "application/json");
  defaultHeaders.set("accept", "application/json");

  const http = createHttpClient<GraphQLAPI>({
    ...rest,
    base: url.origin,
    headers: defaultHeaders,
  });

  return {
    query: async <D, V>(
      {
        query = "",
        fragments = [],
        variables,
        operationName,
      }: {
        query: string;
        fragments?: string[];
        variables?: V;
        operationName?: string;
      },
      init?: RequestInit,
    ): Promise<D> => {
      const { data, errors } = await http[key as any](
        {},
        {
          ...init,
          body: {
            query: [query, ...fragments].join("\n"),
            variables: variables as any,
            operationName,
          },
        },
      ).then((res) => res.json());

      if (Array.isArray(errors) && errors.length > 0) {
        throw errors;
      }

      return data as D;
    },
  };
};

/*
  How update storefront.graphql.json data?
  Search for this query on graphql playground


query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type {
    ...TypeRef
  }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}
*/
