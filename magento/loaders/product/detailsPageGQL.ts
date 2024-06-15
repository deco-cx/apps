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
import { URL_KEY } from "../../utils/constants.ts";
import stringifySearchCriteria from "../../utils/stringifySearchCriteria.ts";

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
  const {
    clientGraphql,
    enableCache,
    useSuffix,
    site,
    minInstallmentValue,
    maxInstallments,
    currencyCode,
    storeId,
    clientAdmin,
  } = ctx;
  const STALE = enableCache ? DecoStale : undefined;
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);
  const defaultPath = useSuffix ? formatUrlSuffix(site) : undefined;

  const getProductSku = async () => {
    const searchCriteria = {
      filterGroups: [
        {
          filters: [{ field: URL_KEY, value: slug }],
        },
      ],
    };

    const queryParams = {
      site,
      currencyCode,
      storeId,
      ...stringifySearchCriteria(searchCriteria),
    };

    const itemSku = await clientAdmin["GET /rest/:site/V1/products"](
      {
        ...queryParams,
      },
      STALE
    ).then((res) => res.json());
    if (!itemSku.items.length) return null;
    return itemSku.items[0].sku;
  };

  const getFullProduct = async (sku: string) =>
    await clientGraphql.query<ProductDetailsGraphQL, ProductDetailsInputs>(
      {
        variables: {
          filter: { sku: { eq: sku } },
        },
        ...GetCompleteProduct(customAttributes, isBreadcrumbProductName),
      },
      STALE
    );

  const sku = await getProductSku();

  if (!sku) {
    console.log("product not found");
    return null;
  }
  const { products } = await getFullProduct(sku);

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
      customAttributes,
      minInstallmentValue,
      maxInstallments,
    }),
    seo: {
      title: products.items[0].meta_title!,
      description: products.items[0].meta_description ?? "",
      canonical: productCanonicalUrl.href,
    },
  };
}

export default loader;
