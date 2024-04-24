import type { ProductDetailsPage } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { parseSlug } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  currencyCode?: string;
}

/**
 * @title VNDA Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const { slug, currencyCode } = props;
  const { api } = ctx;
  if (!slug) return null;
  const { id } = parseSlug(slug);

  const getMaybeProduct = async (id: number) => {
    try {
      const result = await api["GET /V1/products-render-info"]({
        storeId: 1,
        currencyCode: currencyCode || "BRL",
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "url_key",
                  value: String(id),
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      }, STALE);
      return result.json();
    } catch (_error) {
      return null;
    }
  };

  return await getMaybeProduct(id) as unknown as ProductDetailsPage;
}

export default loader;
