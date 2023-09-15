import type { Product } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";

export interface CommonProps {
  /** @description total number of items to display */
  count?: number;

  /** @description search sort parameter */
  sort?:
    | "mais-relevantes"
    | "mais-acessados"
    | "mais-caros"
    | "mais-baratos"
    | "nome-produto"
    | "novidades"
    | "mais-vendidos";
}

export interface DatasourceListProps extends CommonProps {
  /** @description ID to use on Datasource list */
  dataSouceID: string;
  /** @deprecated */
  __apiSelect: "Datasource";
}

export interface SearchListProps extends CommonProps {
  /** @description query to use on search */
  term: string;
  /** @deprecated */
  __apiSelect: "Search";
}

export interface CategoryListProps extends CommonProps {
  /** @description ID to use on Category list */
  categoryID: string;
  /** @deprecated */
  __apiSelect: "Category";
}

export interface BrandListProps extends CommonProps {
  /** @description ID to use on Brand list */
  brandID: string;
  /** @deprecated */
  __apiSelect: "Brand";
}

export interface FlagListProps extends CommonProps {
  /** @description ID to use on Brand list */
  flagID: string;
  /** @deprecated */
  __apiSelect: "Flag";
}

export type Props =
  | DatasourceListProps
  | SearchListProps
  | CategoryListProps
  | BrandListProps
  | FlagListProps;

const fromProps = (props: Props) => {
  if (props.__apiSelect === "Datasource") {
    return {
      apiSelect: props.__apiSelect,
      id: props?.dataSouceID,
    } as const;
  }

  if (props.__apiSelect === "Search") {
    return {
      apiSelect: props.__apiSelect,
      id: props?.term,
    } as const;
  }

  if (props.__apiSelect === "Category") {
    return {
      apiSelect: props.__apiSelect,
      id: props?.categoryID,
    } as const;
  }

  if (props.__apiSelect === "Brand") {
    return {
      apiSelect: props.__apiSelect,
      id: props?.brandID,
    } as const;
  }

  if (props.__apiSelect === "Flag") {
    return {
      apiSelect: props.__apiSelect,
      id: props?.flagID,
    } as const;
  }

  throw new Error(`Unknown props: ${JSON.stringify(props)}`);
};

/**
 * @title LINX Integration
 * @description Product List loader
 */
const productListLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const url = new URL(req.url);
  const { api } = ctx;
  const { id, apiSelect } = fromProps(props);

  const query = await api
    [`GET /web-api/v1/Catalog/Products/:source/:id`]({
      source: apiSelect,
      catalogID: 1,
      id: id,
    }, STALE).then((res) => res.json());

  return query.Products.map((product) =>
    toProduct(ctx, product, {
      url,
      priceCurrency: "BRL",
    })
  );
};

export default productListLoader;
