import { AppContext } from "../../mod.ts";

export interface Status {
  sucesso: boolean;
}

export interface Props {
  idPergunta: number;
  nome: string;
  email: string;
  contato?: string;
  resposta: string;
}

/**
 * @title Wap Integration
 * @description Product Details loader
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
