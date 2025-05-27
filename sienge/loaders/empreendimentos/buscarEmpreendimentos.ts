import { AppContext } from "../../mod.ts";
import {
  createEnterprisesClient,
  GetResponseDocument,
} from "../../clients/enterprises.ts";

export interface Props {
  /**
   * @title ID da Empresa
   * @description Filtrar por código de empresa
   */
  companyId?: number;

  /**
   * @title Tipo
   * @description Tipo do empreendimento
   * @enum [1, 2, 3, 4]
   */
  type?: number;

  /**
   * @title Limite de Resultados
   * @description Quantidade máxima de resultados a serem retornados
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Deslocamento a partir do início da lista
   * @default 0
   */
  offset?: number;

  /**
   * @title Registro de Recebíveis
   * @description Filtro de registro de recebíveis
   * @enum ["B3", "CERC"]
   */
  receivableRegister?: "B3" | "CERC";

  /**
   * @title Apenas Habilitados para Integração
   * @description Retornar apenas obras habilitadas para integração orçamentária
   * @default false
   */
  onlyBuildingsEnabledForIntegration?: boolean;
}

/**
 * @title Buscar Empreendimentos
 * @description Retorna uma lista de empreendimentos (obras) com filtros
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseDocument> => {
  const enterprisesClient = createEnterprisesClient(ctx);

  const response = await enterprisesClient["GET /enterprises"]({
    companyId: props.companyId,
    type: props.type,
    limit: props.limit,
    offset: props.offset,
    receivableRegister: props.receivableRegister,
    onlyBuildingsEnabledForIntegration:
      props.onlyBuildingsEnabledForIntegration,
  });

  const data = await response.json();
  return data;
};

export default loader;
