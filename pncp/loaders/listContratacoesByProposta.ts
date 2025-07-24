import { AppContext } from "../mod.ts";
import { PaginaRetornoRecuperarCompraPublicacaoDTO } from "../client.ts";

interface Props {
  /**
   * @description Final date for filtering proposals (format: yyyyMMdd, e.g., 20241231). Only procurements with proposal deadlines up to this date will be included.
   */
  dataFinal: string;
  /**
   * @description Code of the contracting modality (optional). Common values: 1=Concorrência, 2=Tomada de Preços, 3=Convite, 4=Concurso, 5=Leilão, 6=Pregão Eletrônico (most common), 7=Pregão Presencial, 8=Dispensa, 9=Inexigibilidade
   */
  codigoModalidadeContratacao?: number;
  /**
   * @description State abbreviation (2 letters, e.g., SP, RJ, MG, PB)
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
 * @title PNCP - List Procurements with Open Proposals
 * @description List procurements that are currently accepting proposals, filtered by proposal deadline and other criteria. This endpoint shows active bidding opportunities where suppliers can still submit proposals. Requires valid authentication token.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginaRetornoRecuperarCompraPublicacaoDTO> => {
  const { pagina = 1, tamanhoPagina = 10, ...searchParams } = props;

  const response = await ctx.api["GET /v1/contratacoes/proposta"]({
    ...searchParams,
    pagina,
    tamanhoPagina,
  });

  return response.json();
};

export default loader;
