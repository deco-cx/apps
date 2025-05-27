import { AppContext } from "../../mod.ts";
import { Company, createCompaniesClient } from "../../clients/companies.ts";

export interface Props {
  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máx: 200)
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Índice inicial para paginação dos resultados
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Empresas
 * @description Retorna uma lista de empresas cadastradas no Sienge
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ empresas: Company[]; total: number }> => {
  const companiesClient = createCompaniesClient(ctx);

  const response = await companiesClient["GET /companies"]({
    limit: props.limit,
    offset: props.offset,
  });

  const data = await response.json();

  return {
    empresas: data.results,
    total: data.resultSetMetadata.count,
  };
};

export default loader;
