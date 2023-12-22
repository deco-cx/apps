// deno-lint-ignore-file no-explicit-any
import { FnContext } from "deco/mod.ts";

const compose = <
  TProps = any,
  TResult = any,
  TContext extends FnContext = FnContext,
>(
  ...interceptors: Interceptor<TProps, TResult, TContext>[]
): Interceptor<TProps, TResult, TContext> => {
  const last = interceptors[interceptors.length - 1];
  return async function (p: TProps, req: Request, ctx: TContext) {
    // last called middleware #
    let index = -1;
    return await dispatch(0);
    async function dispatch(
      i: number,
    ): Promise<TResult> {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"));
      }
      index = i;
      const intercept = interceptors[i];
      if (i === interceptors.length) {
        return await last(p, req, ctx);
      }
      return await intercept(p, req, {
        ...ctx,
        next: dispatch.bind(null, i + 1),
      });
    }
  };
};

export type Interceptor<
  TProps = any,
  TResult = any,
  TContext extends FnContext = FnContext,
> = (
  props: TProps,
  req: Request,
  ctx: TContext & { next?: () => Promise<TResult> },
) => Promise<TResult>;

export interface Props {
  "@pipeline": Interceptor[];
  "@block": string;
}

export default function interceptor(p: Props, req: Request, ctx: FnContext) {
  const { "@pipeline": pipeline, "@block": block } = p;
  const composed = compose(...pipeline, (p) => {
    return ctx.invoke(block as any, p);
  });
  return composed(p, req, ctx);
}
