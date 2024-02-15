import { allowCorsFor } from "deco/mod.ts";
import { AppContext } from "../mod.ts";

type Resolvable<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  __resolveType: string;
} & T;

type HandlerValue = Resolvable<{
  page: Resolvable<{ __resolveType: string }>;
}>;

export default function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
) {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  const routes = ctx.routes?.find((routes) =>
    routes.some((route) =>
      (route.handler.value as HandlerValue).__resolveType ===
        "website/handlers/fresh.ts"
    )
  );

  if (!routes) {
    return [];
  }

  return routes.map((route) => ({
    label: `${
      (route.handler.value as HandlerValue).page.__resolveType.split("-")
        .slice(1, -1).join(" ")
    } ( ${route.pathTemplate} )`,
    value: route.pathTemplate,
  }));
}
