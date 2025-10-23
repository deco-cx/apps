import { AppContext } from "../mod.ts";
import { PaginaRetornoRecuperarContratoDTO } from "../client.ts";

interface Props {
  /**
   * @description Initial date for filtering contract publication (format: yyyyMMdd, e.g., 20240101)
   */
  dataInicial: string;
  /**
   * @description Final date for filtering contract publication (format: yyyyMMdd, e.g., 20241231)
   */
  dataFinal: string;
  /**
   * @description Organization CNPJ (14 digits, numbers only). Example: 01615784000125
   */
  cnpjOrgao?: string;
  /**
   * @description Administrative unit code (varies by organization). Example: 01
   */
  codigoUnidadeAdministrativa?: string;
  /**
   * @description User ID for filtering contracts by specific user
   */
  usuarioId?: number;
  /**
   * @description Page number for pagination
   * @default 1
   */
  pagina?: number;
  /**
   * @description Page size for pagination (max 500)
   * @default 10
   */
  tamanhoPagina?: number;
}

/**
 * @title PNCP - List Contracts
 * @description List contracts filtered by publication date range and other criteria. Returns detailed contract information including values, suppliers, validity periods, and contract status. Requires valid authentication token.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginaRetornoRecuperarContratoDTO> => {
  const { pagina = 1, tamanhoPagina = 10, ...searchParams } = props;

  const response = await ctx.api["GET /v1/contratos"]({
    ...searchParams,
    pagina,
    tamanhoPagina,
  });

  return response.json();
};

export default loader;
