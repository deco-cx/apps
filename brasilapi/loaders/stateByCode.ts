import { AppContext } from "../mod.ts";
import { State } from "../client.ts";

interface Props {
  /**
   * @title Código ou Sigla
   * @description Código numérico ou sigla do estado (ex: 35 ou SP)
   */
  code: string | number;
}

/**
 * @title Buscar estado por código ou sigla
 * @description Busca informações detalhadas de um estado brasileiro por código ou sigla
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<State> => {
  const { code } = props;

  const response = await ctx.api["GET /ibge/uf/v1/:code"]({
    code,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar estado: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
