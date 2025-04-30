import { AppContext } from "../mod.ts";
import { Holiday } from "../client.ts";

interface Props {
  /**
   * @title Ano
   * @description Ano para calcular os feriados (1900-2199)
   */
  ano: number;
}

/**
 * @title Listar feriados nacionais
 * @description Retorna os feriados nacionais de um determinado ano
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Holiday[]> => {
  const { ano } = props;

  if (ano < 1900 || ano > 2199) {
    throw new Error("Ano fora do intervalo suportado (1900-2199)");
  }

  const response = await ctx.api["GET /feriados/v1/:ano"]({
    ano,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar feriados: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
