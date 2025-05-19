import { AppContext } from "../../mod.ts";
import {
  createDepartmentsClient,
  Department,
} from "../../clients/departments.ts";

export interface Props {
  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máx: 200)
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Índice inicial para paginação dos resultados
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Departamentos
 * @description Retorna uma lista de departamentos cadastrados no Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ departamentos: Department[]; total: number }> => {
  const departmentsClient = createDepartmentsClient(ctx);

  const response = await departmentsClient["GET /departments"]({
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();

  return {
    departamentos: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
