import { AppContext } from "../../mod.ts";
import { Status } from "../../utils/type.ts";

export interface Props {
  idEvento?: number;
  nome?: string;
  email: string;
  segmento?: "m" | "h" | "i";
  cupom?: boolean;
  informacoesAdicionais?: unknown[];
}

/**
 * @title Wap Integration
 * @description Newsletter Action
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Status | null> => {
  const { api } = ctx;

  const response = await api
    ["POST /api/v2/front/newsletter"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Status>;
};

export default loader;
