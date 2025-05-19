import { AppContext } from "../mod.ts";
import { CNPJ } from "../client.ts";

interface Props {
  /**
   * @title CNPJ
   * @description Número do CNPJ (apenas números)
   */
  cnpj: string;
}

/**
 * @title Buscar informações de CNPJ
 * @description Busca informações detalhadas de um CNPJ na Receita Federal
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CNPJ> => {
  const { cnpj } = props;

  // Remover caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, "");

  const response = await ctx.api["GET /cnpj/v1/:cnpj"]({
    cnpj: cleanCnpj,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar CNPJ: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
