import type {
  FunctionContext,
  LoaderFunction,
} from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/types.ts";

export type RequestURLParam = string;

export interface Props {
  /**
   * @default slug
   * @description Param name to extract from the Request URL
   */
  param: string;
}

/**
 * @title Get params from request parameters
 * @description Set param to slug for routes of type /:slug
 */
const requestToParam: LoaderFunction<
  Props,
  RequestURLParam,
  FunctionContext
> = (_req, ctx) => ({
  data: ctx.params[ctx.state.$live.param || "slug"],
});

export default requestToParam;
