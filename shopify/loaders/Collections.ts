/**
 * @title Loader de Informações da Coleção (VERSÃO DE DEPURAÇÃO)
 * @description Busca dados de uma coleção específica da Shopify pelo seu handle, incluindo metacampos.
 */

// Este console.log provará se o Deno está a importar este arquivo específico.
console.log("--- MODULO CollectionInfo.ts vDEBUG CARREGADO ---");

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

const collectionInfoLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CollectionResult | null> => {
  // Este log é a primeira coisa que deve aparecer se o loader for executado.
  console.log("--- LOADER CollectionInfo.ts vDEBUG INICIADO ---");
  console.log("PROPS RECEBIDAS:", props);

  const { storefront } = ctx;
  const { handle, metafieldIdentifiers = [] } = props;

  // Verificação de segurança para o handle
  if (!handle) {
    // Se esta mensagem não aparecer quando você remove o handle,
    // então este código definitivamente não está a ser executado.
    console.error(
      "DEBUG: A propriedade 'handle' não foi fornecida. O loader não pode continuar.",
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
    console.log(`DEBUG: Executando a query para o handle: "${handle}"`);
    const data = await storefront.query<QueryResult, QueryVariables>({
      query: queryGQL,
      variables: { handle, identifiers: metafieldIdentifiers },
    });

    console.log("DEBUG: Resposta BRUTA da API da Shopify:", data);

    const collection = data?.collection;

    if (!collection) {
      console.log(
        `DEBUG: A API retornou null para o handle "${handle}". Verifique se a coleção existe e está publicada no canal de vendas correto.`,
      );
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

    const result = {
      ...collection,
      metafields: flattenedMetafields,
    };

    console.log("DEBUG: Loader prestes a retornar o seguinte objeto:", result);
    return result;
  } catch (error) {
    console.error(
      `DEBUG: Ocorreu um erro CATCH no loader CollectionInfo.ts para o handle "${handle}":`,
      error,
    );
    return null;
  }
};

export default collectionInfoLoader;
