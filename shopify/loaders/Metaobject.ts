// shopify/loaders/FlexibleMetaobject.ts

import type { AppContext } from "../mod.ts";
import type {
  Metaobject,
  QueryRoot,
  MetaobjectHandleInput, // Importar o tipo necessário
} from "../utils/storefront/storefront.graphql.gen.ts";

export interface FlexibleMetaobjectProps {
  metaobjectType: string;
  handle?: string;
  fields: string[];
  first?: number;
  after?: string;
}

// MetaobjectNode permanece como antes
export interface MetaobjectNode extends Omit<Metaobject, "fields" | "field"> { // Omitir também 'field' se for problemático
  id: string;
  handle: string;
  type: string;
  updatedAt: string;
  [key: string]: any;
}

// FlexibleMetaobjectConnection permanece como antes
export interface FlexibleMetaobjectConnection {
  nodes: MetaobjectNode[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

// FlexibleMetaobjectLoaderResult permanece como antes
export interface FlexibleMetaobjectLoaderResult {
  metaobject?: MetaobjectNode | null;
  metaobjects?: FlexibleMetaobjectConnection | null;
}

const loader = async (
  props: FlexibleMetaobjectProps,
  _req: Request,
  ctx: AppContext,
): Promise<FlexibleMetaobjectLoaderResult> => {
  const { storefront } = ctx;
  const {
    metaobjectType,
    handle,
    fields = [],
    first = 10,
    after,
  } = props;

  if (!metaobjectType || fields.length === 0) {
    console.warn(
      "FlexibleMetaobject: 'metaobjectType' and 'fields' are mandatory and were not provided or 'fields' is empty.",
    );
    return { metaobject: null, metaobjects: null };
  }

  const fieldsString = fields.join("\n");

  let queryGQL: string;
  let queryVariables: Record<string, any>; // Renomeado para clareza

  if (handle) {
    // CORREÇÃO 1: Ajustar a query para usar metaobject(handle: MetaobjectHandleInput!)
    queryGQL = `
      query GetMetaobjectByHandle($handleInput: MetaobjectHandleInput!) {
        metaobject(handle: $handleInput) {
          id
          handle
          type
          updatedAt
          ${fieldsString}
        }
      }
    `;
    queryVariables = {
      handleInput: { // Este é o objeto MetaobjectHandleInput
        type: metaobjectType,
        handle: handle,
      } as MetaobjectHandleInput, // Type assertion para maior segurança
    };
  } else {
    queryGQL = `
      query GetMetaobjectsByType($type: String!, $first: Int!, $after: String) {
        metaobjects(type: $type, first: $first, after: $after, sortKey: HANDLE, reverse: false) {
          nodes {
            id
            handle
            type
            updatedAt
            ${fieldsString}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    queryVariables = {
      type: metaobjectType,
      first: first,
    };
    if (after) {
      queryVariables.after = after;
    }
  }

  // Definindo os tipos para TData e TVariables explicitamente
  type QueryResultType = {
    metaobject?: QueryRoot["metaobject"]; // CORREÇÃO 1: Usar metaobject
    metaobjects?: QueryRoot["metaobjects"];
  };
  type QueryVariablesType = typeof queryVariables;

  try {
    // CORREÇÃO 2: Chamar storefront.query com um único objeto como argumento
    // e fornecer os dois argumentos de tipo (TData, TVariables)
    const data = await storefront.query<QueryResultType, QueryVariablesType>(
      {
        query: queryGQL, // A string da query
        variables: queryVariables, // O objeto de variáveis
      },
    );

    if (handle && data?.metaobject) { // CORREÇÃO 1: Acessar data.metaobject
      const resultMetaobject = data.metaobject as MetaobjectNode | null | undefined;
      return { metaobject: resultMetaobject };
    } else if (!handle && data?.metaobjects) {
      const resultMetaobjects = data.metaobjects as unknown as FlexibleMetaobjectConnection | null | undefined;
      return { metaobjects: resultMetaobjects };
    }
    // Caso data seja null ou os campos esperados não existam
    return { metaobject: null, metaobjects: null };

  } catch (error) {
    console.error("Error fetching metaobjects:", error);
    // Considerar lançar o erro para tratamento global, se aplicável
    return { metaobject: null, metaobjects: null };
  }
};

export default loader;