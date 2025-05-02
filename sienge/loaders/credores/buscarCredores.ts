import { AppContext } from "../../mod.ts";
import {
  createCreditorsClient,
  GetResponseCreditors,
} from "../../clients/creditors.ts";

export interface Props {
  /**
   * @title CPF
   * @description CPF do credor sem máscara, somento números
   */
  cpf?: string;

  /**
   * @title CNPJ
   * @description CNPJ do credor sem máscara, somento números
   */
  cnpj?: string;

  /**
   * @title Credor
   * @description Nome, nome fantasia ou código do credor
   */
  creditor?: string;

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
 * @title Buscar Credores
 * @description Retorna a lista de credores do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseCreditors> => {
  const creditorsClient = createCreditorsClient(ctx);

  const response = await creditorsClient["GET /creditors"]({
    cpf: props.cpf,
    cnpj: props.cnpj,
    creditor: props.creditor,
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();
  return data;
};

export default loader;
