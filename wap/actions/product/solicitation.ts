import { AppContext } from "../../mod.ts";

export interface Status {
  sucesso: boolean;
}

export interface Props {
  idProduto: number;
  idAtributoValor: number;
  nome: string;
  email: string;
  contato?: string;
  mensagem?: string;
  mailing: boolean;
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
    ["POST /api/v2/front/product/solicitation"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Status>;
};

export default loader;
