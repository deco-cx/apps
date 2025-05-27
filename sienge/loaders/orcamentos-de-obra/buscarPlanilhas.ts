import { AppContext } from "../../mod.ts";
import {
  createBuildingCostEstimationsClient,
  ResultSetMetadata,
  Sheet,
} from "../../clients/buildingCostEstimations.ts";

/**
 * Props para busca de planilhas de orçamento
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para busca das planilhas de orçamento
   */
  buildingId: number;

  /**
   * @title Offset
   * @description Deslocamento para paginação dos resultados (padrão: 0)
   */
  offset?: number;

  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máximo: 200, padrão: 100)
   */
  limit?: number;
}

/**
 * @title Buscar Planilhas de Orçamento
 * @description Retorna as planilhas de orçamento de uma obra
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  metadata: ResultSetMetadata;
  planilhas: Sheet[];
}> => {
  const client = createBuildingCostEstimationsClient(ctx);

  try {
    const response = await client
      ["GET /building-cost-estimations/:buildingId/sheets"]({
        buildingId: props.buildingId,
        offset: props.offset,
        limit: props.limit,
      });

    const result = await response.json();

    return {
      metadata: result.resultSetMetadata,
      planilhas: result.results,
    };
  } catch (error) {
    console.error("Erro ao buscar planilhas de orçamento:", error);
    throw new Error(
      `Erro ao buscar planilhas de orçamento: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default loader;
