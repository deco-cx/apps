// shopify/loaders/FlexibleMetaobject.ts

import type { AppContext } from "../mod.ts";
import type {
  Metaobject,
  MetaobjectHandleInput,
  QueryRoot,
} from "../utils/storefront/storefront.graphql.gen.ts";

export interface FlexibleMetaobjectProps {
  metaobjectType?: string; // Opcional se 'id' for fornecido
  handle?: string; // Handle textual do metaobjeto (para buscar com 'type')
  id?: string; // GID do metaobjeto (ex: "gid://shopify/Metaobject/123")
  fields: string[];
  first?: number; // Para listar metaobjetos por tipo
  after?: string; // Para paginação ao listar
}

export interface MetaobjectNode extends Omit<Metaobject, "fields" | "field"> {
  id: string;
  handle: string;
  type: string;
  updatedAt: string;
  [key: string]: any;
}

export interface FlexibleMetaobjectConnection {
  nodes: MetaobjectNode[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

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
    id, // Novo parâmetro
    fields = [],
    first = 10,
    after,
  } = props;

  if (fields.length === 0) {
    console.warn(
      "FlexibleMetaobject: 'fields' are mandatory and were not provided or 'fields' is empty.",
    );
    return { metaobject: null, metaobjects: null };
  }

  const fieldsString = fields.join("\n");

  let queryGQL: string;
  let queryVariables: Record<string, any>;

  if (id) { // Prioridade para busca por GID
    queryGQL = `
      query GetMetaobjectById($id: ID!) {
        metaobject(id: $id) {
          id
          handle
          type
          updatedAt
          ${fieldsString}
        }
      }
    `;
    queryVariables = { id };
  } else if (handle && metaobjectType) {
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
      handleInput: {
        type: metaobjectType,
        handle: handle,
      } as MetaobjectHandleInput,
    };
  } else if (metaobjectType) { // Listar por tipo
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
  } else {
    console.warn(
      "FlexibleMetaobject: Either 'id', or 'handle' and 'metaobjectType', or just 'metaobjectType' (for listing) must be provided.",
    );
    return { metaobject: null, metaobjects: null };
  }

  type QueryResultType = {
    metaobject?: QueryRoot["metaobject"];
    metaobjects?: QueryRoot["metaobjects"];
  };
  type QueryVariablesType = typeof queryVariables;

  try {
    const data = await storefront.query<QueryResultType, QueryVariablesType>(
      {
        query: queryGQL,
        variables: queryVariables,
      },
    );

    if (id || (handle && metaobjectType)) { // Se buscou um único objeto
      const resultMetaobject = data.metaobject as
        | MetaobjectNode
        | null
        | undefined;
      return { metaobject: resultMetaobject };
    } else if (metaobjectType) { // Se listou objetos
      const resultMetaobjects = data.metaobjects as unknown as
        | FlexibleMetaobjectConnection
        | null
        | undefined;
      return { metaobjects: resultMetaobjects };
    }
    return { metaobject: null, metaobjects: null };
  } catch (error) {
    console.error("Error fetching metaobjects:", error);
    return { metaobject: null, metaobjects: null };
  }
};

export default loader;
