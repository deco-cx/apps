import { AppContext } from "../mod.ts";
import { getSession } from "./session.ts";
import { ProductSearch } from "./types.ts";

export interface Props {
  ids: string[];
  select: string;
}

export default async function getProducts(
  props: Props,
  ctx: AppContext,
): Promise<null | ProductSearch> {
  const { slc, organizationId, siteId } = ctx;

  const session = getSession(ctx);
  const headers = new Headers({
    Authorization: `Bearer ${session.token}`,
  });

  const { select, ids } = props;
  let id = "";

  if (ids) {
    id = props.ids.join(",");
  }

  const response = await slc
    ["GET /product/shopper-products/v1/organizations/:organizationId/products"](
      {
        organizationId,
        siteId: siteId,
        ids: id,
        select: select,
      },
      { headers: headers },
    );

  const productSearchResult = await response.json();

  return productSearchResult;
}
