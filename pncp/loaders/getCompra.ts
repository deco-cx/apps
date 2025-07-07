import { AppContext } from "../mod.ts";
import { RecuperarCompraDTO } from "../client.ts";

interface Props {
  /**
   * @description CNPJ of the organization (14 digits, numbers only). Example: 01615784000125
   */
  cnpj: string;
  /**
   * @description Year of the procurement (4 digits). Example: 2025
   */
  ano: number;
  /**
   * @description Sequential number of the procurement within the year. Example: 76
   */
  sequencial: number;
}

/**
 * @title PNCP - Get Procurement Details
 * @description Retrieve detailed information about a specific procurement by CNPJ, year, and sequential number. Returns comprehensive data including bidding modality, legal basis, values, dates, and procurement status. Requires valid authentication token.
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
