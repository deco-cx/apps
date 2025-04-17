import { AppContext } from "../mod.ts";
import { Corretora } from "../client.ts";

interface Props {
  /**
   * @title CNPJ
   * @description CNPJ da corretora (apenas números)
   */
  cnpj: string;
}

/**
 * @title Buscar corretora por CNPJ
 * @description Busca informações de uma corretora específica pelo CNPJ
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Corretora> => {
  const { cnpj } = props;

  // Remover caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, "");

  const response = await ctx.api["GET /cvm/corretoras/v1/:cnpj"]({
    cnpj: cleanCnpj,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar corretora: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
