import { STALE } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { URL_KEY } from "../../utils/constants.ts";
import stringifySearchCriteria from "../../utils/stringifySearchCriteria.ts";

interface Props {
  slug: RequestURLParam;
}

export type ProductId = Promise<string>;

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  return `${url.href}${props.slug}`;
};

/**
 * @title Magento Integration
 * @description Return product ID loader
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): ProductId {
  const { slug } = props;

  const { clientAdmin, site, storeId, currencyCode = "BRL", enableCache } = ctx;

  const response = await clientAdmin["GET /rest/:site/V1/products-render-info"](
    {
      site,
      storeId,
      currencyCode,
      fields: "items[id]",
      ...stringifySearchCriteria({
        filterGroups: [
          {
            filters: [{ field: URL_KEY, value: slug }],
          },
        ],
      }),
    },
    enableCache ? STALE : undefined,
  ).then((res) => res.json());

  return response.items[0].id.toString();
}
