import { AppContext } from "../mod.ts";
import { PNCPOrgao } from "../client.ts";

export interface Props {
  /**
   * @title CNPJ do Órgão
   * @description CNPJ do órgão
   */
  cnpj: string;
}

/**
 * @title Obter Órgão do PNCP
 * @description Obtém os detalhes de um órgão específico no Portal Nacional de Contratações Públicas
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PNCPOrgao> => {
  const { cnpj } = props;

  const response = await ctx.api["GET /api/orgao/:cnpj"]({
    cnpj,
  });

  return response;
};

export default loader;