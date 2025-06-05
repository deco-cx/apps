import { AppContext } from "../../mod.ts";
import { ResolveURL } from "../../utils/clientGraphql/queries.ts";
import { ResolveURLGraphQL } from "../../utils/clientGraphql/types.ts";

export interface Props {
  path: string;
}

export default async function getRouteType(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ResolveURLGraphQL["route"]> {
  const { clientGraphql } = ctx;

  const { route } = await clientGraphql.query<
    ResolveURLGraphQL,
    { url: string }
  >(
    {
      variables: { url: props.path || "/" },
      ...ResolveURL,
    },
  );

  return route;
}
