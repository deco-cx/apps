import { AppContext } from "../../mod.ts";

export interface Status {
  sucesso: boolean;
  mensagem: string;
}

export interface Associated {
  nome: string;
  sexo: "m" | "h" | "i";
  dataNascimento: string;
  informacoesAdicionais?: unknown[];
}

export interface Props {
  email: string;
  associados: Associated[];
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
    ["POST /api/v2/front/newsletter/associates"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Status>;
};

export default loader;
