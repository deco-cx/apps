import { AppContext } from "../mod.ts";
import { PNCPOrgaoResponse } from "../client.ts";

export interface Props {
  /**
   * @title UF
   * @description Unidade Federativa para filtrar
   */
  uf?: string;

  /**
   * @title Esfera
   * @description Esfera para filtrar (federal, estadual, municipal)
   */
  esfera?: string;

  /**
   * @title Poder
   * @description Poder para filtrar (executivo, legislativo, judiciário)
   */
  poder?: string;

  /**
   * @title Busca
   * @description Texto para busca
   */
  q?: string;

  /**
   * @title Página
   * @description Número da página para paginação
   * @default 1
   */
  pagina?: number;

  /**
   * @title Tamanho da Página
   * @description Registros por página
   * @default 10
   */
  tam_pagina?: number;
}

/**
 * @title Listar Órgãos do PNCP
 * @description Lista os órgãos cadastrados no Portal Nacional de Contratações Públicas
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PNCPOrgaoResponse> => {
  const {
    pagina = 1,
    tam_pagina = 10,
    ...searchParams
  } = props;

  const response = await ctx.api["GET /api/orgaos"]({
    pagina,
    tam_pagina,
    ...searchParams,
  });

  return response;
};

export default loader;