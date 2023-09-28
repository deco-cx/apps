import { STALE } from "../../utils/fetch.ts";
import { nullOnNotFound } from "../../utils/http.ts";
import type { AppContext } from "../mod.ts";
import type { API } from "../utils/client.ts";

/**
 * @title LINX Integration
 * @description Load Page as JSON
 */
async function loader(
  props: Record<string, string>,
  req: Request,
  ctx: AppContext,
): Promise<API["GET /*splat"]["response"] | null> {
  const upstream = new URL(req.url);
  const params: Record<string, string[]> = {};
  upstream.searchParams.forEach((value, key) => {
    params[key] = params[key] || [];
    params[key].push(value);
  });

  const splat = `${upstream.pathname.slice(1)}.json`;

  const defaults = {
    fc: params.fc || props.fc || "false",
  };

  const response = await ctx.api["GET /*splat"](
    { splat, ...params, ...props, ...defaults },
    STALE,
  ).then((res) => res.json()).catch(nullOnNotFound);

  return response;
}

export default loader;
