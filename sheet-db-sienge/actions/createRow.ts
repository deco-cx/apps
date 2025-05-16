import { AppContext } from "../mod.ts";
import { CreateRowParams, SheetDBRow } from "../client.ts";

interface Props extends CreateRowParams {
  /**
   * @title Row Data
   * @description Data for the new row(s) to be added
   */
  data: SheetDBRow | SheetDBRow[];
}

/**
 * @title Create Row
 * @description Add one or more rows to SheetDB
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ created: number } | SheetDBRow[]> => {
  const { data, ...params } = props;
  
  const response = await ctx.api["POST /"](
    params,
    {
      body: { data }
    }
  );

  return await response.json();
};

export default action; 