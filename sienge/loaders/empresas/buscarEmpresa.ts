import { AppContext } from "../../mod.ts";
import { Company, createCompaniesClient } from "../../clients/companies.ts";

export interface Props {
  /**
   * @title ID da Empresa
   * @description Código da empresa no Sienge
   */
  companyId: number;
}

/**
 * @title Buscar Empresa
 * @description Retorna os detalhes de uma empresa específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Company | null> => {
  const companiesClient = createCompaniesClient(ctx);

  try {
    const response = await companiesClient["GET /companies/:companyId"]({
      companyId: props.companyId,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return null;
  }
};

export default loader;
