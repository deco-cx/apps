import { AppContext } from "../mod.ts";
import { PaginaRetornoRecuperarContratoDTO } from "../client.ts";

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
   * @description Organization CNPJ (optional)
   */
  cnpjOrgao?: string;
  /**
   * @description Administrative unit code (optional)
   */
  codigoUnidadeAdministrativa?: string;
  /**
   * @description User ID (optional)
   */
  usuarioId?: number;
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
 * @title PNCP - List Contracts
 * @description List contracts filtered by publication date range and other criteria.
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
