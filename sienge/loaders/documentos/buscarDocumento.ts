import { AppContext } from "../../mod.ts";
import {
  createDocumentIdentificationsClient,
  DocumentIdentification,
} from "../../clients/documentIdentifications.ts";

export interface Props {
  /**
   * @title ID do Documento
   * @description Código do documento de identificação no Sienge
   */
  documentIdentificationId: number;
}

/**
 * @title Buscar Documento
 * @description Retorna os detalhes de um documento de identificação específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DocumentIdentification | null> => {
  const documentIdentificationsClient = createDocumentIdentificationsClient(
    ctx,
  );

  try {
    const response = await documentIdentificationsClient
      ["GET /document-identifications/:documentIdentificationId"]({
        documentIdentificationId: props.documentIdentificationId,
      });

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    return null;
  }
};

export default loader;
