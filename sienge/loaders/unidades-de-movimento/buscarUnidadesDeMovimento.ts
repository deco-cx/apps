import { AppContext } from "../../mod.ts";
import {
  createResourceUnitsOfMovementClient,
  ResultSetMetadata,
  UnitOfMovement,
} from "../../clients/resourceUnitsOfMovement.ts";

/**
 * Props para busca de unidades de movimento de insumos
 */
interface Props {
  /**
   * @title ID da Obra
   * @description Código da obra para busca de unidades de movimento
   */
  buildingId: number;

  /**
   * @title ID do Insumo (opcional)
   * @description Quando informado, retorna apenas as unidades de movimento desse insumo específico
   */
  resourceId?: number;

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
 * @title Buscar Unidades de Movimento de Insumos
 * @description Retorna as unidades de movimento dos insumos de uma obra
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  metadata: ResultSetMetadata;
  unidades: UnitOfMovement[];
}> => {
  const client = createResourceUnitsOfMovementClient(ctx);

  try {
    const response = await client
      ["GET /building-cost-estimations/:buildingId/resource-units-of-movement"](
        {
          buildingId: props.buildingId,
          resourceId: props.resourceId,
          offset: props.offset,
          limit: props.limit,
        },
      );

    const result = await response.json();

    return {
      metadata: result.resultSetMetadata,
      unidades: result.results,
    };
  } catch (error) {
    console.error("Erro ao buscar unidades de movimento:", error);
    throw new Error(
      `Erro ao buscar unidades de movimento: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default loader;
