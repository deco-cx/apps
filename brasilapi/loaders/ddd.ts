import { AppContext } from "../mod.ts";
import { DDDInfo } from "../client.ts";

interface Props {
  /**
   * @title DDD
   * @description Código de DDD (Discagem Direta à Distância)
   */
  ddd: number;
}

/**
 * @title Buscar informações de DDD
 * @description Retorna o estado e lista de cidades de um DDD
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DDDInfo> => {
  const { ddd } = props;

  if (ddd < 11 || ddd > 99) {
    throw new Error("DDD inválido");
  }

  const response = await ctx.api["GET /ddd/v1/:ddd"]({
    ddd,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar DDD: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
