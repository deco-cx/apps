import type { State } from "../../mod.ts";
import {
  createParametersClient,
  ParameterDTO,
} from "../../clients/parameters.ts";

/**
 * Loader para obter parâmetros do Sienge
 */
export interface Props {
  /**
   * @title ID do Parâmetro
   * @description ID do parâmetro a ser consultado
   */
  id: string;
}

/**
 * @title Buscar Parâmetro
 * @description Obtém um parâmetro específico do Sienge pelo ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<ParameterDTO> => {
  const { id } = props;
  const client = createParametersClient(ctx.state);

  const response = await client["GET /parameters/:id"]({
    id,
  });

  // Handle response based on the TypedResponse contract
  const data = await response.json();
  return data;
};

export default loader;
