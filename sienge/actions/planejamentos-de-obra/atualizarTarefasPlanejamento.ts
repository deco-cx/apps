import { AppContext } from "../../mod.ts";
import {
  createBuildingProjectsClient,
  Task,
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
   * @title Permitir Deletar Custos Tarefa
   * @description Permite deletar qualquer custo tarefa vinculado à uma tarefa
   * @default true
   */
  allowDeleteTaskCostItem?: boolean;

  /**
   * @title Tarefas
   * @description Lista de tarefas a serem atualizadas no planejamento
   */
  tarefas: Task[];
}

/**
 * @title Atualizar Tarefas de Planejamento
 * @description Atualiza as tarefas na planilha de planejamento de uma obra
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const buildingProjectsClient = createBuildingProjectsClient(ctx);

  try {
    await buildingProjectsClient
      ["PUT /building-projects/:buildingId/sheets/:buildingUnitId/tasks"](
        {
          buildingId: props.buildingId,
          buildingUnitId: props.buildingUnitId,
          allowDeleteTaskCostItem: props.allowDeleteTaskCostItem,
        },
        { body: props.tarefas },
      );
  } catch (error) {
    console.error("Erro ao atualizar tarefas de planejamento:", error);
    throw new Error(
      `Erro ao atualizar tarefas de planejamento: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return;
};

export default action;
