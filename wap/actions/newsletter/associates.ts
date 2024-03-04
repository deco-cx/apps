import { AppContext } from "../../mod.ts";
import { Status } from "../../utils/type.ts";

export interface NewsletterStatus extends Status {
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

// ! This Action has been added but not tested because we dont have a use case

/**
 * @title Wap Integration
 * @description Newslleter Associates Action
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<NewsletterStatus | null> => {
  const { api } = ctx;

  const response = await api
    ["POST /api/v2/front/newsletter/associates"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<NewsletterStatus>;
};

export default loader;
