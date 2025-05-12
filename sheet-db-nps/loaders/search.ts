import type { AppContext } from "../mod.ts";
import type { SheetDbNpsRow } from "../client.ts";

export interface Props {
  // SheetDB search/query parameters
  sheet?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc" | "random";
  sort_method?: string;
  sort_date_format?: string;
  cast_numbers?: string;
  single_object?: boolean;
  mode?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";
  // Search fields (all possible spreadsheet columns, but allow any string key)
  [key: string]:
    | string
    | number
    | boolean
    | (string | number | boolean)[]
    | undefined;
}

/**
 * @title Search NPS Rows (AND)
 * @description Search for rows matching all conditions in the SheetDB spreadsheet.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SheetDbNpsRow[]> => {
  // Only assign if value is not undefined, and always cast to string or array of string
  const searchParams: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "undefined") continue;
    if (Array.isArray(value)) {
      searchParams[key] = value.filter((v) => typeof v !== "undefined").map((v) => String(v));
    } else {
      searchParams[key] = String(value);
    }
  }
  const response = await ctx.api["GET /search"](searchParams);
  return await response.json();
};

export default loader; 