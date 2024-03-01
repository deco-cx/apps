import { AppContext } from "../../mod.ts";
import { Status } from "../../utils/type.ts";

export interface Props {
  hashEmail: string;
  nome: string;
  email: string;
  contato: string;
  assunto?: string;
  mensagem?: string;
}

/**
 * @title Wap Integration
 * @description Form Action
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Status | null> => {
  const { api } = ctx;

  const response = await api
    ["POST /api/v2/front/form/contact"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Status>;
};

export default loader;
