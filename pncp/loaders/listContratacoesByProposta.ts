import { AppContext } from "../mod.ts";
import { PaginaRetornoRecuperarCompraPublicacaoDTO } from "../client.ts";

interface Props {
  /**
   * @description Final date for filtering proposals (format: yyyyMMdd, e.g., 20241231)
   */
  dataFinal: string;
  
  /**
   * @title Código da Modalidade de Contratação
   * @description Código da modalidade de contratação (opcional)
   */
  codigoModalidadeContratacao?: number;
  
  /**
   * @description State abbreviation (optional)
   */
  uf?: string;
  
  /**
   * @title Código do Município (IBGE)
   * @description Código IBGE do município
   */
  codigoMunicipioIbge?: string;
  
  /**
   * @description Organization CNPJ (optional)
   */
  cnpj?: string;
  
  /**
   * @title Código da Unidade Administrativa
   * @description Código da unidade administrativa (máximo 30 caracteres)
   * @maxLength 30
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
 * @title PNCP - List Procurements with Open Proposals
 * @description List procurements that are currently accepting proposals, filtered by end date and other criteria.
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