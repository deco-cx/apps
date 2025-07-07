import { AppContext } from "../mod.ts";
import { RecuperarCompraDTO } from "../client.ts";

interface Props {
  /**
   * @description CNPJ of the organization (numbers only, no formatting)
   */
  cnpj: string;
  /**
   * @description Year of the procurement
   */
  ano: number;
  /**
   * @description Sequential number of the procurement
   */
  sequencial: number;
}

/**
 * @title PNCP - Get Procurement Details
 * @description Retrieve detailed information about a specific procurement by CNPJ, year, and sequential number.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<RecuperarCompraDTO> => {
  const { cnpj, ano, sequencial } = props;

  const response = await ctx.api
    ["GET /v1/orgaos/:cnpj/compras/:ano/:sequencial"]({
      cnpj,
      ano: ano.toString(),
      sequencial: sequencial.toString(),
    });

  return response.json();
};

export default loader;
