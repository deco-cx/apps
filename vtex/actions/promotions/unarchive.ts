import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  /**
   * @description Promotion ID to unarchive
   */
  idCalculatorConfiguration: string;
}

export const defaultVisibility = "private";

/**
 * @title Unarchive Promotion
 * @description Unarchive a promotion by its ID
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown> => {
  const { vcs } = ctx;
  const { idCalculatorConfiguration } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcs[
    "POST /api/rnb/pvt/calculatorconfiguration/:idCalculatorConfiguration/unarchive"
  ](
    { idCalculatorConfiguration },
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  return response.json();
};

export default action;

