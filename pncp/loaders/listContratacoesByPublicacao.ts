import { AppContext } from "../mod.ts";
import { PaginaRetornoRecuperarCompraPublicacaoDTO } from "../client.ts";

interface Props {
  /**
   * @description Initial date for filtering (format: yyyyMMdd, e.g., 20240101)
   */
  dataInicial: string;
  /**
   * @description Final date for filtering (format: yyyyMMdd, e.g., 20241231)
   */
  dataFinal: string;
  /**
   * @description Code of the contracting modality
   */
  codigoModalidadeContratacao: number;
  /**
   * @description Code of the dispute mode (optional)
   */
  codigoModoDisputa?: number;
  /**
   * @description State abbreviation (optional)
   */
  uf?: string;
  /**
   * @description IBGE municipality code (optional)
   */
  codigoMunicipioIbge?: string;
  /**
   * @description Organization CNPJ (optional)
   */
  cnpj?: string;
  /**
   * @description Administrative unit code (optional)
   */
  codigoUnidadeAdministrativa?: string;
  /**
   * @description User ID (optional)
   */
  idUsuario?: number;
  /**
   * @description Page number for pagination
   * @default 1
   */
  pagina?: number;
  /**
   * @description Page size for pagination
   * @default 10
   */
  tamanhoPagina?: number;
}

/**
 * @title PNCP - List Procurements by Publication Date
 * @description List procurements filtered by publication date range and other criteria.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginaRetornoRecuperarCompraPublicacaoDTO> => {
  const { pagina = 1, tamanhoPagina = 10, ...searchParams } = props;

  const response = await ctx.api["GET /v1/contratacoes/publicacao"]({
    ...searchParams,
    pagina,
    tamanhoPagina,
  });

  return response.json();
};

export default loader; 