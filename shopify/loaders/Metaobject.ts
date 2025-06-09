// Os seus imports originais serão mantidos
import type { AppContext } from "../mod.ts";
import type {
  Metaobject,
  MetaobjectHandleInput,
  QueryRoot,
} from "../utils/storefront/storefront.graphql.gen.ts";

// Suas interfaces originais serão mantidas
export interface FlexibleMetaobjectProps {
  metaobjectType?: string;
  handle?: string;
  id?: string;
  fields: string[];
  first?: number;
  after?: string;
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

const buildGraphQLFields = (fieldKeys: string[]): string => {
  return fieldKeys.map((key) =>
    `${key}: field(key: "${key}") {
      value
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }`
  ).join("\n");
};

const loader = async (
  props: FlexibleMetaobjectProps,
  _req: Request,
  ctx: AppContext,
): Promise<FlexibleMetaobjectLoaderResult> => {
  const { storefront } = ctx;
  const {
    metaobjectType,
    handle,
    id,
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

  // A string de campos agora é construída com a sintaxe correta.
  const fieldsString = buildGraphQLFields(fields);

  let queryGQL: string;
  let queryVariables: Record<string, any>;

  // A lógica para definir a query e as variáveis permanece a mesma
  if (id) {
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
  } else if (metaobjectType) {
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

    // Função auxiliar para "achatar" a resposta da API, facilitando o uso
    const flattenMetaobject = (metaobject: any) => {
      if (!metaobject) return null;

      const flattened: Record<string, any> = {
        id: metaobject.id,
        handle: metaobject.handle,
        type: metaobject.type,
        updatedAt: metaobject.updatedAt,
      };

      for (const key of fields) {
        if (metaobject[key]) {
          if (metaobject[key].reference) {
            // Se for um campo de referência (ex: imagem), o valor é o objeto de referência
            flattened[key] = metaobject[key].reference;
          } else {
            // Caso contrário, é o valor simples
            flattened[key] = metaobject[key].value;
          }
        }
      }
      return flattened as MetaobjectNode;
    };

    if (id || (handle && metaobjectType)) {
      return { metaobject: flattenMetaobject(data?.metaobject) };
    } else if (metaobjectType) {
      const flattenedNodes = data?.metaobjects?.nodes.map(flattenMetaobject)
        .filter(Boolean) as MetaobjectNode[];
      return {
        metaobjects: {
          nodes: flattenedNodes,
          pageInfo: data?.metaobjects?.pageInfo,
        } as FlexibleMetaobjectConnection,
      };
    }

    return { metaobject: null, metaobjects: null };
  } catch (error) {
    console.error("Error fetching metaobjects:", error);
    return { metaobject: null, metaobjects: null };
  }
};

export default loader;
