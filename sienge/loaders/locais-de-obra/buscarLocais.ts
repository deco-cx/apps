import type { State } from "../../mod.ts";
import { createSitesClient, Site } from "../../clients/sites.ts";

/**
 * Loader para obter listagem de sites/obras do Sienge
 */
export interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para filtrar os locais
   */
  buildingId: string;

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
 * @title Buscar Locais de Obra
 * @description Obtém uma lista de locais de obra do Sienge filtrados por ID da obra
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<Site[]> => {
  const { buildingId, page = 1, pageSize = 100 } = props;
  const client = createSitesClient(ctx.state);

  const response = await client["GET /sites"]({
    buildingId,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  // Handle response based on the TypedResponse contract
  const data = await response.json();
  return data.results;
};

export default loader;
