import type { State } from "../../mod.ts";
import {
  CostCenter,
  createCostCentersClient,
} from "../../clients/costCenters.ts";

/**
 * Loader para obter listagem de centros de custo do Sienge
 */
export interface Props {
  /**
   * @title Página
   * @description Número da página para paginação
   */
  page?: number;

  /**
   * @title Itens por Página
   * @description Quantidade de itens por página
   */
  pageSize?: number;
}

/**
 * @title Buscar Centros de Custo
 * @description Obtém uma lista de centros de custo do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<CostCenter[]> => {
  const { page = 1, pageSize = 100 } = props;
  const client = createCostCentersClient(ctx.state);

  const response = await client["GET /cost-centers"]({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  // Handle response based on the TypedResponse contract
  const data = await response.json();
  return data.results;
};

export default loader;
