import { AppContext } from "../mod.ts";
import { Bank } from "../client.ts";

interface Props {
  /**
   * @title Código do Banco
   * @description Código do banco (ex: 1 para Banco do Brasil)
   */
  code: number;
}

/**
 * @title Buscar banco por código
 * @description Busca as informações de um banco a partir do código
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Bank> => {
  const { code } = props;

  const response = await ctx.api["GET /banks/v1/:code"]({
    code,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar banco: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
