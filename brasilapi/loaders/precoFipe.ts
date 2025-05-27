import { AppContext } from "../mod.ts";
import { Fipe } from "../client.ts";

interface Props {
  /**
   * @title Código FIPE
   * @description Código FIPE do veículo (ex: 001004-9)
   */
  codigoFipe: string;

  /**
   * @title Código Tabela Referência
   * @description Código da tabela de referência (opcional)
   */
  tabela_referencia?: number;
}

/**
 * @title Preço de veículo FIPE
 * @description Consulta o preço de um veículo usando a tabela FIPE pelo código
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Fipe[]> => {
  const { codigoFipe, tabela_referencia } = props;

  const options: Record<string, unknown> = {};
  if (tabela_referencia) {
    options.tabela_referencia = tabela_referencia;
  }

  const response = await ctx.api["GET /fipe/preco/v1/:codigoFipe"]({
    codigoFipe,
  }, options);

  if (!response.ok) {
    throw new Error(`Erro ao buscar preço FIPE: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
