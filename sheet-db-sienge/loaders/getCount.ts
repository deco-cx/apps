import { AppContext } from "../mod.ts";
import { CountResponse } from "../client.ts";

interface Props {
  /**
   * @title Sheet Name
   * @description The sheet (tab) you want to select
   */
  sheet?: string;
}

/**
 * @title Get Row Count
 * @description Fetch the number of rows in the document from SheetDB
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CountResponse> => {
  const response = await ctx.api["GET /count"]({
    sheet: props.sheet
  });

  return await response.json();
};

export default loader; 