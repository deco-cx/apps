import { AppContext } from "../../mod.ts";
import {
  createCreditorsClient,
  GetResponsePixInformation,
} from "../../clients/creditors.ts";

export interface Props {
  /**
   * @title ID do Credor
   * @description ID único do credor no Sienge
   */
  creditorId: number;

  /**
   * @title Limite de resultados
   * @description Quantidade máxima de resultados da pesquisa. Máximo: 200
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Deslocamento entre o começo da lista
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Informações Pix
 * @description Retorna as informações de chaves PIX de um credor específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponsePixInformation> => {
  const creditorsClient = createCreditorsClient(ctx);

  const response = await creditorsClient
    ["GET /creditors/:creditorId/pix-informations"]({
      creditorId: props.creditorId,
      limit: props.limit,
      offset: props.offset,
    });

  const data = await response.json();
  return data;
};

export default loader;
