import { AppContext } from "../../mod.ts";
import { Status } from "../../utils/type.ts";

export interface Props {
  nivel: "produto" | "categoria" | "marca" | "landingPage";
  idNivel: number;
  nome: string;
  email: string;
  contato?: string;
  pergunta: string;
}

/**
 * @title Wap Integration
 * @description Question Action
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Status | null> => {
  const { api } = ctx;

  const response = await api
    ["POST /api/v2/front/question"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Status>;
};

export default loader;
