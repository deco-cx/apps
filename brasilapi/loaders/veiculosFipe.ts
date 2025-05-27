import { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title Tipo de Veículo
   * @description Tipo de veículo (carros, motos, caminhoes)
   */
  tipoVeiculo: string;

  /**
   * @title Código da Marca
   * @description Código numérico da marca
   */
  codigoMarca: number;

  /**
   * @title Código Tabela Referência
   * @description Código da tabela de referência (opcional)
   */
  tabela_referencia?: number;
}

/**
 * @title Veículos por marca (FIPE)
 * @description Lista os veículos de uma determinada marca e tipo
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Array<{ modelo: string }>> => {
  const { tipoVeiculo, codigoMarca, tabela_referencia } = props;

  if (!["carros", "motos", "caminhoes"].includes(tipoVeiculo)) {
    throw new Error(
      "Tipo de veículo inválido. Use 'carros', 'motos' ou 'caminhoes'",
    );
  }

  const options: Record<string, unknown> = {};
  if (tabela_referencia) {
    options.tabela_referencia = tabela_referencia;
  }

  const response = await ctx.api
    ["GET /fipe/veiculos/v1/:tipoVeiculo/:codigoMarca"]({
      tipoVeiculo,
      codigoMarca,
    }, options);

  if (!response.ok) {
    throw new Error(`Erro ao buscar veículos: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
