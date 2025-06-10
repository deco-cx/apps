/**
 * @title Loader de Informações da Coleção
 * @description Busca dados de uma coleção específica da Shopify pelo seu handle, incluindo metacampos.
 */

import type { AppContext } from "../mod.ts";
import type {
  Collection,
  HasMetafieldsIdentifier,
  QueryRoot,
} from "../utils/storefront/storefront.graphql.gen.ts";

export interface Props {
  handle: string;
  metafieldIdentifiers?: HasMetafieldsIdentifier[];
}

export interface CollectionResult extends Omit<Collection, "metafields"> {
  metafields: Record<string, any>;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CollectionResult | null> => {
  const { storefront } = ctx;
  const { handle, metafieldIdentifiers = [] } = props;

  if (!handle) {
    console.error("Collection Loader: A propriedade 'handle' é obrigatória.");
    return null;
  }

  const queryGQL = `
    query GetCollectionByHandle($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        image { url, altText }
        metafields(identifiers: $identifiers) {
          key
          namespace
          value
          type
          reference {
            ... on MediaImage {
              image { url, altText }
            }
          }
        }
      }
    }
  `;

  type QueryResult = { collection: QueryRoot["collection"] };
  type QueryVariables = {
    handle: string;
    identifiers: HasMetafieldsIdentifier[];
  };

  try {
    const data = await storefront.query<QueryResult, QueryVariables>({
      query: queryGQL,
      variables: { handle, identifiers: metafieldIdentifiers },
    });

    const collection = data?.collection;

    if (!collection) {
      return null;
    }

    const flattenedMetafields: Record<string, any> = {};
    if (collection.metafields) {
      for (const metafield of collection.metafields) {
        if (metafield) {
          flattenedMetafields[metafield.key] = metafield.reference ||
            metafield.value;
        }
      }
    }

    return {
      ...collection,
      metafields: flattenedMetafields,
    };
  } catch (error) {
    console.error(
      `Ocorreu um erro no loader da Coleção para o handle "${handle}":`,
      error,
    );
    return null;
  }
};

export default loader;
