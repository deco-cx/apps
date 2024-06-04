// deno-lint-ignore-file no-explicit-any
import { DecoRequestInit } from "./fetch.ts";
import { createHttpClient, HttpClientOptions } from "./http.ts";

const decoCacheArgLength = 55;

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
    body?: {
      query: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    };
  }
>;

interface GraphQLQueryProps<V> {
  query: string;
  fragments?: string[];
  variables?: V;
  operationName?: string;
}

export const gql = (query: TemplateStringsArray, ...fragments: string[]) =>
  query.reduce((a, c, i) => `${a}${fragments[i - 1]}${c}`);

export const createGraphqlClient = ({
  endpoint,
  ...rest
}: GraphqlClientOptions) => {
  const url = new URL(endpoint);
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
      }: GraphQLQueryProps<V>,
      init?: DecoRequestInit
    ): Promise<D> => {
      const { key, props } = getMethodAndProps<V>({
        query,
        fragments,
        variables,
        operationName,
        url,
      });
      const { searchParams, body } = getParamsAndBody({ key, props, init });
      const { data, errors } = await http[key as any](searchParams, {
        ...body,
      }).then((res) => res.json());

      if (Array.isArray(errors) && errors.length > 0) {
        throw errors;
      }

      return data as D;
    },
  };
};

const getMethodAndProps = <V>({
  query,
  fragments,
  url,
  operationName,
  variables,
}: GraphQLQueryProps<V> & { url: URL }) => {
  const fullQuery = joinQueryArgs({
    query,
    fragments,
  });
  const stringfiedVariables = stringfyVariables<V>({ variables });
  const minifiedQuery = minifyString(fullQuery);
  const postMethodBool = isPostMethodRequired(
    url.href,
    minifiedQuery,
    stringfiedVariables,
    operationName
  );

  const { key, executableQuery, executableVariables } = postMethodBool
    ? {
        key: `POST ${url.pathname}`,
        executableQuery: fullQuery,
        executableVariables: variables,
      }
    : {
        key: `GET ${url.pathname}`,
        executableQuery: minifiedQuery,
        executableVariables: stringfiedVariables,
      };

  return {
    key,
    props: {
      query: executableQuery,
      variables: executableVariables,
      operationName,
    },
  };
};

const getParamsAndBody = ({
  key,
  props,
  init,
}: ReturnType<typeof getMethodAndProps> & { init?: DecoRequestInit }) => {
  if (key.startsWith("POST")) {
    return { searchParams: {}, body: { body: props, ...init } };
  }
  return { searchParams: { ...props }, body: { ...init } };
};

const minifyString = (s: string): string => {
  s = s.replace(
    /\{([^{}]*)\}/g,
    (_, p1) => `{${p1.replace(/\s+/g, " ").trim()}}`
  );
  s = s
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")");
  return s.trim();
};

const joinQueryArgs = ({
  query,
  fragments = [],
}: Pick<GraphQLQueryProps<any>, "query" | "fragments">) =>
  [query, ...fragments].join("\n");

const stringfyVariables = <V>({
  variables,
}: Pick<GraphQLQueryProps<V>, "variables">) => JSON.stringify(variables);

const isPostMethodRequired = (
  href: string,
  query: string,
  variables: string,
  operationName?: string
): boolean => {
  if (query.startsWith("mutation")) {
    return true;
  }

  const urlLength = `${href}?query=${encodeURI(query)}&variables=${encodeURI(
    variables
  )}&operationname=${operationName}`;
  return urlLength.length + decoCacheArgLength > 2000;
};
