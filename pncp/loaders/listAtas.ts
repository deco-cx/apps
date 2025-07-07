import { AppContext } from "../mod.ts";
import { PaginaRetornoAtaRegistroPrecoPeriodoDTO } from "../client.ts";

interface Props {
  /**
   * @description Initial date for filtering validity period (format: yyyyMMdd, e.g., 20240101)
   */
  dataInicial: string;

  /**
   * @description Final date for filtering validity period (format: yyyyMMdd, e.g., 20241231)
   */
  dataFinal: string;

  /**
   * @description User ID (optional)
   */
  idUsuario?: number;

  /**
   * @description Organization CNPJ (optional)
   */
  cnpj?: string;

  /**
   * @description Administrative unit code (optional)
   */
  codigoUnidadeAdministrativa?: string;

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
 * @title PNCP - List Price Registration Records
 * @description List price registration records (atas) filtered by validity period and other criteria.
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
