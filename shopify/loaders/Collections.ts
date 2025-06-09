/**
 * @title Loader de Informações da Coleção
 * @description Busca dados de uma coleção específica da Shopify pelo seu handle, incluindo metacampos.
 */

// Este import deve funcionar corretamente dentro da estrutura do app da Shopify
import type { AppContext } from "../mod.ts";
import type {
  Collection,
  HasMetafieldsIdentifier,
  QueryRoot,
} from "../utils/storefront/storefront.graphql.gen.ts";

/**
 * Propriedades para o loader da coleção.
 */
export interface Props {
  /**
   * @title Handle da Coleção
   * @description O identificador único (handle) da coleção a ser buscada.
   */
  handle: string;
  /**
   * @title Identificadores dos Metacampos
   * @description Lista opcional de metacampos para buscar na coleção.
   * @example [{ "namespace": "custom", "key": "hero_banner" }]
   */
  metafieldIdentifiers?: HasMetafieldsIdentifier[];
}

/**
 * O objeto de retorno, com os metacampos formatados para fácil acesso.
 */
export interface CollectionResult extends Omit<Collection, "metafields"> {
  metafields: Record<string, any>;
}

/**
 * Loader que busca uma coleção da Shopify.
 */
const collectionInfoLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext, // Dentro do app, este 'ctx' terá o 'storefront'.
): Promise<CollectionResult | null> => {
  const { storefront } = ctx;
  const { handle, metafieldIdentifiers = [] } = props;

  if (!handle) {
    console.error(
      "CollectionInfo Loader: A propriedade 'handle' é obrigatória.",
    );
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
        image {
          url
          altText
        }
        metafields(identifiers: $identifiers) {
          key
          namespace
          value
          type
          reference {
            ... on MediaImage {
              image { url altText }
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
      console.log(`Coleção com handle "${handle}" não encontrada.`);
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
      `Erro ao buscar a coleção no Shopify (handle: ${handle}):`,
      error,
    );
    return null;
  }
};

export default collectionInfoLoader;
