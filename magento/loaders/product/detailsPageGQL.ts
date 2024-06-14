import type { ListItem, ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE as DecoStale } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import {
  CustomFields,
  ProductDetailsGraphQL,
  ProductDetailsInputs,
} from "../../utils/clientGraphql/types.ts";
import { formatUrlSuffix, getCustomFields } from "../../utils/utilsGraphQL.ts";
import { GetCompleteProduct } from "../../utils/clientGraphql/queries.ts";
import { toProductGraphQL } from "../../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @title Product custom attributes
   */
  customFields: CustomFields;
  isBreadcrumbProductName?: boolean;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  const customAttributes = getCustomFields(props.customFields, ["ALL"]);
  return `${req.url}-customAtt:${
    customAttributes?.join("|") ?? "NONE"
  }-breadcrumbName:${props.isBreadcrumbProductName ?? false}-PDP-GQL`;
};

/**
 * @title Magento Integration - Product Details Page in GraphQL
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { slug, customFields, isBreadcrumbProductName } = props;
  const { clientGraphql, enableCache, useSuffix, site } = ctx;
  const STALE = enableCache ? DecoStale : undefined;
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);
  const defaultPath = useSuffix ? formatUrlSuffix(site) : undefined;

  const { products } = await clientGraphql.query<
    ProductDetailsGraphQL,
    ProductDetailsInputs
  >(
    {
      variables: {
        search: slug,
        filter: { url_key: { eq: slug } },
      },
      ...GetCompleteProduct(customAttributes, isBreadcrumbProductName),
    },
    enableCache ? STALE : undefined
  );

  const productCanonicalUrl = new URL(
    (defaultPath ?? "") + products.items[0].canonical_url,
    url.origin
  );

  const productListElement = {
    "@type": "ListItem",
    item: productCanonicalUrl.href,
    position: 1,
    name: products.items[0].name,
  } as ListItem;

  const itemListElement: ListItem[] = isBreadcrumbProductName
    ? [productListElement]
    : products.items[0].categories?.map(
        ({ position, url_key, name }) =>
          ({
            "@type": "ListItem",
            item: new URL((defaultPath ?? "") + url_key, url.origin).href,
            position,
            name,
          } as ListItem)
      ) ?? [productListElement];

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    product: toProductGraphQL(products.items[0], {
      originURL: url,
      imagesQtd: 999,
    }),
    seo: {
      title: products.items[0].meta_title!,
      description: products.items[0].meta_description ?? "",
      canonical: productCanonicalUrl.href,
    },
  };
}

export default loader;
