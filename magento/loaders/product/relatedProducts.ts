import type { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  CustomFields,
  ProductShelfGraphQL,
} from "../../utils/clientGraphql/types.ts";
import { GetRelatedProducts } from "../../utils/clientGraphql/queries.ts";
import { formatUrlSuffix, getCustomFields } from "../../utils/graphql.ts";
import { STALE } from "../../../utils/fetch.ts";
import { toProductGraphQL } from "../../utils/transform.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";

export interface Props {
  /**
   * @title Product ID to fetch related items
   */
  slug: RequestURLParam;

  /**
   * @title Include product custom attributes
   */
  customFields?: CustomFields;

  /**
   * @title Type of related products
   * @default related
   */
  type?: "related" | "upsell" | "crosssell";
}

interface RelatedProductInputs {
  filter: {
    url_key: {
      eq: string;
    };
  };
}

/**
 * @title Magento Integration - Related Products
 * @description Related Products loader
 */
async function loader(
  { slug, customFields, type = "related" }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const {
    clientGraphql,
    imagesQtd,
    site,
    useSuffix,
    enableCache,
    minInstallmentValue,
    maxInstallments,
  } = ctx;

  const url = new URL(req.url);
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);

  console.log({ slug });
  const variables: RelatedProductInputs = {
    filter: {
      url_key: {
        eq: slug,
      },
    },
  };

  const { products } = await clientGraphql.query<
    ProductShelfGraphQL,
    RelatedProductInputs
  >(
    {
      variables,
      ...GetRelatedProducts(type, customAttributes),
    },
    enableCache ? STALE : undefined,
  );

  if (!products?.items || products.items.length === 0) {
    return null;
  }

  const currentProduct = products.items?.[0];
  const relatedProducts = currentProduct?.[`${type}_products`];

  if (!relatedProducts) {
    return null;
  }

  return relatedProducts.map((p) =>
    toProductGraphQL(p, {
      originURL: url,
      imagesQtd,
      defaultPath: useSuffix ? formatUrlSuffix(site) : undefined,
      customAttributes,
      minInstallmentValue,
      maxInstallments,
    })
  ) ?? null;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, _req: Request, _ctx: AppContext) => {
  return `${props.slug}-${props.type}-RELATED`;
};

export default loader;
