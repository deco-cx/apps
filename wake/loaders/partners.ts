import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { handleAuthError } from "../utils/authError.ts";
import type { AppContext } from "../mod.ts";
import { GetPartners } from "../utils/graphql/queries.ts";
import {
  GetPartnersQuery,
  GetPartnersQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title Wake Integration - Partners
 * @description Partners loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<GetPartnersQuery["partners"]> => {
  const { storefront } = ctx;
  const { slug } = props;

  const headers = parseHeaders(req.headers);

  let data;
  try {
    data = await storefront.query<
      GetPartnersQuery,
      GetPartnersQueryVariables
    >({
      variables: { first: 1, alias: [slug] },
      ...GetPartners,
    }, { headers });
  } catch (error: unknown) {
    handleAuthError(error, "load partner information");
  }

  return data?.partners ?? undefined;
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const params = new URLSearchParams([
    ["slug", String(props.slug)],
  ]);

  const url = new URL(req.url);
  url.search = params.toString();
  return url.href;
};

export default loader;
