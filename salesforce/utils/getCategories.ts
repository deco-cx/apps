import { AppContext } from "../mod.ts";
import { getSession } from "./session.ts";
import { CategorySalesforce } from "./types.ts";

export interface Props {
  id: string;
}

export default async function getCategories(
  props: Props,
  ctx: AppContext,
): Promise<CategorySalesforce | null> {
  try {
    const { slc, organizationId, siteId } = ctx;

    const session = getSession(ctx);
    const headers = new Headers({
      Authorization: `Bearer ${session.token}`,
    });

    const response = await slc
      ["GET /product/shopper-products/v1/organizations/:organizationId/categories/:id"](
        {
          organizationId,
          id: props.id,
          siteId: siteId,
        },
        { headers: headers },
      );

    const productSearchResult = await response.json();

    return productSearchResult;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
