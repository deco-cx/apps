import { AppContext } from "../../mod.ts";
import {
  createMovableAssetsClient,
  MovableAsset,
  ResultSetMetadata,
} from "../../clients/movableAssets.ts";

/**
 * Props para busca de bens móveis
 */
interface Props {
  /**
   * @title Código do Patrimônio
   * @description Filtrar pelo código do patrimônio
   */
  patrimonyId?: number;

  /**
   * @title Código de Barras/RFID
   * @description Filtrar pelo código de barras ou RFID
   */
  barCode?: string;

  /**
   * @title Centro de Custo
   * @description Filtrar pelo empreendimento/centro de custo
   */
  costCenter?: string;

  /**
   * @title Modelo
   * @description Filtrar pelo modelo do bem
   */
  model?: number;

  /**
   * @title Plaqueta/Placa
   * @description Filtrar pela plaqueta ou placa do bem
   */
  plateId?: string;

  /**
   * @title Situação
   * @description Filtrar pela situação do bem (A - Ativo ou B - Baixado)
   */
  situation?: "A" | "B";

  /**
   * @title Offset
   * @description Deslocamento para paginação dos resultados (padrão: 0)
   */
  offset?: number;

  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máximo: 200, padrão: 100)
   */
  limit?: number;
}

/**
 * @title Buscar Bens Móveis
 * @description Retorna uma lista de bens móveis com base nos filtros informados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  metadata: ResultSetMetadata;
  bens: MovableAsset[];
}> => {
  const client = createMovableAssetsClient(ctx);

  try {
    const response = await client["GET /patrimony/movable"]({
      patrimonyId: props.patrimonyId,
      barCode: props.barCode,
      costCenter: props.costCenter,
      model: props.model,
      plateId: props.plateId,
      situation: props.situation,
      offset: props.offset,
      limit: props.limit,
    });

    const result = await response.json();

    return {
      metadata: result.resultSetMetadata,
      bens: result.results,
    };
  } catch (error) {
    console.error("Erro ao buscar bens móveis:", error);
    throw new Error(
      `Erro ao buscar bens móveis: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default loader;
