import { AppContext } from "../mod.ts";
import { MarcaFIPE } from "../client.ts";

interface Props {
  /**
   * @title Tipo de Veículo
   * @description Tipo de veículo (carros, motos, caminhoes)
   */
  tipoVeiculo: string;

  /**
   * @title Código Tabela Referência
   * @description Código da tabela de referência (opcional)
   */
  tabela_referencia?: number;
}

/**
 * @title Marcas de veículos FIPE
 * @description Lista as marcas de veículos de um determinado tipo
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MarcaFIPE[]> => {
  const { tipoVeiculo, tabela_referencia } = props;

  if (!["carros", "motos", "caminhoes"].includes(tipoVeiculo)) {
    throw new Error(
      "Tipo de veículo inválido. Use 'carros', 'motos' ou 'caminhoes'",
    );
  }

  const options: Record<string, unknown> = {};
  if (tabela_referencia) {
    options.tabela_referencia = tabela_referencia;
  }

  const response = await ctx.api["GET /fipe/marcas/v1/:tipoVeiculo"]({
    tipoVeiculo,
  }, options);

  if (!response.ok) {
    throw new Error(`Erro ao buscar marcas: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
