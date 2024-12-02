import { RequestURLParam } from "../../website/functions/requestToParam.ts";
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

  const data = await storefront.query<
    GetPartnersQuery,
    GetPartnersQueryVariables
  >({
    variables: { first: 1, alias: [slug] },
    ...GetPartners,
  }, { headers });

  return data.partners ?? undefined;
};

export default loader;
