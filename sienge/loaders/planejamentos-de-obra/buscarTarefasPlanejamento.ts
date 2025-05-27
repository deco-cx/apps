import { AppContext } from "../../mod.ts";
import {
  createBuildingProjectsClient,
  GetResponseTask,
} from "../../clients/buildingProjects.ts";

export interface Props {
  /**
   * @title Código da Obra
   * @description Código da obra
   */
  buildingId: number;

  /**
   * @title Código da Unidade Construtiva
   * @description Código da unidade construtiva da obra
   */
  buildingUnitId: number;

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
 * @title Buscar Tarefas de Planejamento
 * @description Retorna as tarefas da versão atual da planilha de planejamento de uma obra
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseTask> => {
  const buildingProjectsClient = createBuildingProjectsClient(ctx);

  const response = await buildingProjectsClient
    ["GET /building-projects/:buildingId/sheets/:buildingUnitId/tasks"]({
      buildingId: props.buildingId,
      buildingUnitId: props.buildingUnitId,
      limit: props.limit,
      offset: props.offset,
    });

  const data = await response.json();
  return data;
};

export default loader;
