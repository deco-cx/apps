import { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title Sheet Name
   * @description The sheet (tab) you want to select
   */
  sheet?: string;
}

/**
 * @title Get Column Names
 * @description Fetch all column names from SheetDB
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<string[]> => {
  const response = await ctx.api["GET /keys"]({
    sheet: props.sheet
  });

  return await response.json();
};

export default loader; 