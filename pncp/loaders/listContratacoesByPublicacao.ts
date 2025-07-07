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
   * @description Code of the contracting modality. Common values: 1=Concorrência, 2=Tomada de Preços, 3=Convite, 4=Concurso, 5=Leilão, 6=Pregão Eletrônico, 7=Pregão Presencial, 8=Dispensa, 9=Inexigibilidade
   */
  codigoModalidadeContratacao: number;
  /**
   * @description Code of the dispute mode (optional). Common values: 1=Aberto, 2=Fechado, 3=Combinado
   */
  codigoModoDisputa?: number;
  /**
   * @description State abbreviation (2 letters, e.g., SP, RJ, MG)
   */
  uf?: string;
  /**
   * @description IBGE municipality code (7 digits)
   */
  codigoMunicipioIbge?: string;
  /**
   * @description Organization CNPJ (14 digits, numbers only)
   */
  cnpj?: string;
  /**
   * @description Administrative unit code (varies by organization)
   */
  codigoUnidadeAdministrativa?: string;
  /**
   * @description User ID for filtering by specific user
   */
  idUsuario?: number;
  /**
   * @description Page number for pagination
   * @default 1
   */
  pagina?: number;
  /**
   * @description Page size for pagination (max 50)
   * @default 10
   */
  tamanhoPagina?: number;
}

/**
 * @title PNCP - List Procurements by Publication Date
 * @description List procurements filtered by publication date range and other criteria. This endpoint requires authentication and accesses the official PNCP API for detailed procurement data.
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
