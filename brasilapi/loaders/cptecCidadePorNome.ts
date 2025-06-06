import { AppContext } from "../mod.ts";
import { City } from "../client.ts";

interface Props {
  /**
   * @title Nome da Cidade
   * @description Nome ou parte do nome da cidade a ser buscada
   */
  cityName: string;
}

/**
 * @title Buscar cidade por nome (CPTEC)
 * @description Busca cidades pelo nome ou parte do nome nos serviços do CPTEC/INPE
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<City[]> => {
  const { cityName } = props;

  const response = await ctx.api["GET /cptec/v1/cidade/:cityName"]({
    cityName,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar cidade: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
