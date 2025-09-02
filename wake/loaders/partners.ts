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

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  // Don't cache if no slug is provided
  if (!props.slug) {
    return null;
  }

  // Use the slug for cache uniqueness - each partner has a unique slug
  const params = new URLSearchParams([
    ["slug", String(props.slug)],
    ["first", "1"], // Always fetch exactly 1 partner
  ]);

  const url = new URL(req.url);
  url.search = params.toString();

  // Sort parameters for consistent cache keys
  const sortedParams = new URLSearchParams();
  Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => sortedParams.set(key, value));

  url.search = sortedParams.toString();
  return url.href;
};

export default loader;
