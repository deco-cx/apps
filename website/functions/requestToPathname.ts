import type { FunctionContext, LoaderFunction } from "deco/types.ts";
import { RequestURLParam } from "./requestToParam.ts";

export interface Props {
  /**
   * @description Path name to remove from the URL - Stringfied regex. Example: "/product/" transform "/product/my-sku" in "my-sku". "/product/|/store" transform "/product/my-sku/store" in "my-sku"
   * @format dynamic-options
   */
  pathname?: string;
}

/**
 * @title Get params from request pathname.
 * @description Set a pathname to remove from url and extract a slug
 */
const requestToParam: LoaderFunction<
  Props,
  RequestURLParam,
  FunctionContext
> = (req, ctx) => {
  const url = new URL(req.url);
  const regex = new RegExp("(" + ctx.state.$live.pathname + ")", "g");
  return {
    data: url.pathname.toString().replace(regex, ""),
  };
};

export default requestToParam;
