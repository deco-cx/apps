import { AppContext } from "../mod.ts";
import { NCM } from "../client.ts";

interface Props {
  /**
   * @title Código NCM
   * @description Código do NCM (ex: 01012100)
   */
  code: string;
}

/**
 * @title Buscar NCM por código
 * @description Busca informações detalhadas de um NCM específico por código
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NCM> => {
  const { code } = props;

  const response = await ctx.api["GET /ncm/v1/:code"]({
    code,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar NCM: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
