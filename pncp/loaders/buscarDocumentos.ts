import { AppContext } from "../mod.ts";
import { PNCPSearchParams, PNCPSearchResponse } from "../client.ts";

export interface Props extends PNCPSearchParams {
  /**
   * @title Tipos de Documento
   * @description Tipos de documento para buscar (edital, contrato, ata, etc.)
   * @default edital
   */
  tipos_documento?: string;

  /**
   * @title Ordenação
   * @description Como ordenar os resultados
   * @default -data
   */
  ordenacao?: string;

  /**
   * @title Página
   * @description Número da página para paginação
   * @default 1
   */
  pagina?: number;

  /**
   * @title Tamanho da Página
   * @description Quantidade de registros por página
   * @default 10
   */
  tam_pagina?: number;

  /**
   * @title Status
   * @description Status do documento
   * @default recebendo_proposta
   */
  status?: string;

  /**
   * @title Busca
   * @description Texto livre para busca
   */
  q?: string;

  /**
   * @title UF
   * @description Unidade Federativa
   */
  uf?: string;

  /**
   * @title Município
   * @description Município
   */
  municipio?: string;

  /**
   * @title Valor Mínimo
   * @description Valor mínimo para filtrar
   */
  valor_min?: number;

  /**
   * @title Valor Máximo
   * @description Valor máximo para filtrar
   */
  valor_max?: number;

  /**
   * @title Data Inicial
   * @description Data inicial para filtrar (formato YYYY-MM-DD)
   */
  data_inicial?: string;

  /**
   * @title Data Final
   * @description Data final para filtrar (formato YYYY-MM-DD)
   */
  data_final?: string;
}

/**
 * @title Buscar Documentos do PNCP
 * @description Busca documentos no Portal Nacional de Contratações Públicas
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PNCPSearchResponse> => {
  const {
    tipos_documento = "edital",
    ordenacao = "-data",
    pagina = 1,
    tam_pagina = 10,
    status = "recebendo_proposta",
    ...searchParams
  } = props;

  const response = await ctx.api["GET /api/search"]({
    tipos_documento,
    ordenacao,
    pagina,
    tam_pagina,
    status,
    ...searchParams,
  });

  return response;
};

export default loader;