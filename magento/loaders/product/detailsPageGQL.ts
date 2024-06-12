import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE as DecoStale } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import {
  CustomFields,
  ProductDetailsGraphQL,
  ProductDetailsInputs,
} from "../../utils/clientGraphql/types.ts";
import { getCustomFields } from "../../utils/utilsGraphQL.ts";
import { GetProduct } from "../../utils/clientGraphql/queries.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @title Product custom attributes
   */
  customFields: CustomFields;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: Props, req: Request, _ctx: AppContext) => {
  return `${req.url}-PDP-GQL`;
};

/**
 * @title Magento Integration - Product Details Page in GraphQL
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<ProductDetailsPage | null> {
  //const url = new URL(req.url);
  const { slug, customFields } = props;
  const {
    clientGraphql,
    enableCache,
  } = ctx;
  const STALE = enableCache ? DecoStale : undefined;
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);

  const { products } = await clientGraphql.query<
    ProductDetailsGraphQL,
    ProductDetailsInputs
  >(
    {
      variables: {
        search: slug,
        filter: { url_key: { eq: slug } },
        pageSize: 1,
        currentPage: 1,
      },
      ...GetProduct(customAttributes),
    },
    enableCache ? STALE : undefined
  );

  console.log(products);

  return null;
}

export default loader