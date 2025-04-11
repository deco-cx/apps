import { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title Sigla UF
   * @description Sigla da Unidade Federativa (ex: SP, RJ, SC)
   */
  siglaUF: string;

  /**
   * @title Provedores
   * @description Lista de provedores separados por vírgula (dados-abertos-br,gov,wikipedia)
   */
  providers?: string;
}

/**
 * @title Buscar municípios por UF
 * @description Retorna a lista de municípios de uma Unidade Federativa
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Array<{ nome: string; codigo_ibge: string }>> => {
  const { siglaUF, providers } = props;

  const options: Record<string, unknown> = {};
  if (providers) {
    options.providers = providers;
  }

  const response = await ctx.api["GET /ibge/municipios/v1/:siglaUF"]({
    siglaUF: siglaUF.toUpperCase(),
  }, options);

  if (!response.ok) {
    throw new Error(`Erro ao buscar municípios: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
