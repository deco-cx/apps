import type { FunctionContext, LoaderFunction } from "deco/types.ts";

export type RequestPathname = string;

export interface Props {
  /**
   * @description Path name to remove from the URL. To remove more than one pathname, use the | operator. Example: "product" transform "/product/my-sku" in "my-sku". "product|store" transform "/product/my-sku/store" in "my-sku"
   * @format dynamic-options
   * @options website/loaders/options/urlParams.ts
   */
  pathname?: string;
}

/**
 * @title Remove pathname
 */
const requestToParam: LoaderFunction<
  Props,
  RequestPathname,
  FunctionContext
> = (req, ctx) => {
  const url = new URL(req.url);
  const regex = new RegExp("/(" + ctx.state.$live.pathname + "/)", "g");
  return {
    data: url.pathname.toString().replace(regex, ""),
  };
};

export default requestToParam;