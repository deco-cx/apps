import { AppContext } from "../../mod.ts";
import {
  createFixedAssetsClient,
  GetResponseFixedAssets,
} from "../../clients/fixedAssets.ts";

export interface Props {
  /**
   * @title Código do Patrimônio
   * @description Código do patrimônio
   */
  patrimonyId?: number;

  /**
   * @title Empreendimento/Centro de custo
   * @description Empreendimento/Centro de custo
   */
  costCenter?: string;

  /**
   * @title Detalhamento
   * @description Detalhamento
   */
  detail?: string;

  /**
   * @title Situação
   * @description Situação do bem podendo ser A - Ativo ou B - Baixados
   */
  situation?: "A" | "B";

  /**
   * @title Limite de resultados
   * @description Quantidade máxima de resultados da pesquisa. Máximo: 200
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Deslocamento entre o começo da lista
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Bens Imóveis
 * @description Retorna a lista de bens imóveis do Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetResponseFixedAssets> => {
  const fixedAssetsClient = createFixedAssetsClient(ctx);

  const response = await fixedAssetsClient["GET /patrimony/fixed"]({
    patrimonyId: props.patrimonyId,
    costCenter: props.costCenter,
    detail: props.detail,
    situation: props.situation,
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();
  return data;
};

export default loader;
