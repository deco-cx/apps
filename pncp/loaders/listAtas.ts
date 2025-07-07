import { AppContext } from "../mod.ts";
import { PaginaRetornoAtaRegistroPrecoPeriodoDTO } from "../client.ts";

interface Props {
  /**
   * @description Initial date for filtering validity period (format: yyyyMMdd, e.g., 20240101). Filters price registration records that are valid from this date onwards.
   */
  dataInicial: string;
  /**
   * @description Final date for filtering validity period (format: yyyyMMdd, e.g., 20241231). Filters price registration records that are valid up to this date.
   */
  dataFinal: string;
  /**
   * @description User ID for filtering by specific user
   */
  idUsuario?: number;
  /**
   * @description Organization CNPJ (14 digits, numbers only). Example: 01615784000125
   */
  cnpj?: string;
  /**
   * @description Administrative unit code (varies by organization). Example: 01
   */
  codigoUnidadeAdministrativa?: string;
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
 * @title PNCP - List Price Registration Records
 * @description List price registration records (atas) filtered by validity period and other criteria. Price registration records are agreements that allow multiple purchases from pre-selected suppliers at pre-negotiated prices. Requires valid authentication token.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginaRetornoAtaRegistroPrecoPeriodoDTO> => {
  const { pagina = 1, tamanhoPagina = 10, ...searchParams } = props;

  const response = await ctx.api["GET /v1/atas"]({
    ...searchParams,
    pagina,
    tamanhoPagina,
  });

  return response.json();
};

export default loader;
