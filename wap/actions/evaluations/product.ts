import { AppContext } from "../../mod.ts";
import { Status } from "../../utils/type.ts";

export interface Props {
  idProduto: number;
  nome: string;
  email: string;
  nota: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  recomenda: boolean;
  anexos?: string[];
}

/**
 * @title Wap Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Status | null> => {
  const { api } = ctx;

  const response = await api
    ["POST /api/v2/front/evaluations/product"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Status>;
};

export default loader;
