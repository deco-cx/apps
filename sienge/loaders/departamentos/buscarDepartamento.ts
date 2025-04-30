import { AppContext } from "../../mod.ts";
import {
  createDepartmentsClient,
  Department,
} from "../../clients/departments.ts";

export interface Props {
  /**
   * @title ID do Departamento
   * @description Código do departamento no Sienge
   */
  departmentId: number;
}

/**
 * @title Buscar Departamento
 * @description Retorna os detalhes de um departamento específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Department | null> => {
  const departmentsClient = createDepartmentsClient(ctx);

  try {
    const response = await departmentsClient["GET /departments/:departmentId"]({
      departmentId: props.departmentId,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar departamento:", error);
    return null;
  }
};

export default loader;
