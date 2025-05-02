import { AppContext } from "../../mod.ts";
import {
  createBuildingCostEstimationsClient,
  ResultSetMetadata,
  SheetItem,
} from "../../clients/buildingCostEstimations.ts";

/**
 * Props para busca de itens de planilha de orçamento
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para busca dos itens da planilha de orçamento
   */
  buildingId: number;

  /**
   * @title ID da Unidade Construtiva
   * @description Código da unidade construtiva que identifica a planilha
   */
  building_unit_id: number;

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
 * @title Buscar Itens de Planilha de Orçamento
 * @description Retorna os itens de uma planilha de orçamento de obra
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  metadata: ResultSetMetadata;
  itens: SheetItem[];
}> => {
  const client = createBuildingCostEstimationsClient(ctx);

  try {
    const response = await client
      ["GET /building-cost-estimations/:buildingId/sheets/:building_unit_id/items"](
        {
          buildingId: props.buildingId,
          building_unit_id: props.building_unit_id,
          offset: props.offset,
          limit: props.limit,
        },
      );

    const result = await response.json();

    return {
      metadata: result.resultSetMetadata,
      itens: result.results,
    };
  } catch (error) {
    console.error("Erro ao buscar itens da planilha de orçamento:", error);
    throw new Error(
      `Erro ao buscar itens da planilha de orçamento: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default loader;
