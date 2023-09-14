import type { Product } from "../../commerce/types.ts";
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
}

export interface SearchListProps extends CommonProps {
  /** @description query to use on search */
  term: string;
}

export interface CategoryListProps extends CommonProps {
  /** @description ID to use on Category list */
  categoryID: string;
}

export interface BrandListProps extends CommonProps {
  /** @description ID to use on Brand list */
  brandID: string;
}

export interface FlagListProps extends CommonProps {
  /** @description ID to use on Brand list */
  flagID: string;
}

export type Props =
  | DatasourceListProps
  | SearchListProps
  | CategoryListProps
  | BrandListProps
  | FlagListProps;

const isDatasouceList = (p: any): p is DatasourceListProps =>
  typeof p.dataSouceID === "string" && typeof p.apiSelect === "string";

const isSearchList = (p: any): p is SearchListProps =>
  typeof p.term === "string" && typeof p.apiSelect === "string";

const isCategoryList = (p: any): p is CategoryListProps =>
  typeof p.categoryID === "string" && typeof p.apiSelect === "string";

const isBrandList = (p: any): p is BrandListProps =>
  typeof p.brandID === "string" && typeof p.apiSelect === "string";

const isFlagList = (p: any): p is BrandListProps =>
  typeof p.flagID === "string" && typeof p.apiSelect === "string";

const fromProps = (props: Props) => {
  if (isDatasouceList(props)) {
    return {
      apiSelect: "Datasource",
      id: props?.dataSouceID,
    } as const;
  }

  if (isSearchList(props)) {
    return {
      apiSelect: "Search",
      id: props?.term,
    } as const;
  }

  if (isCategoryList(props)) {
    return {
      apiSelect: "Category",
      id: props?.categoryID,
    } as const;
  }

  if (isBrandList(props)) {
    return {
      apiSelect: "Brand",
      id: props?.brandID,
    } as const;
  }

  if (isFlagList(props)) {
    return {
      apiSelect: "Flag",
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
    [`GET /web-api/v1/Catalog/Products/${apiSelect}/:id/?catalogID=1`]({
      id: id,
    }, { deco: { cache: "stale-while-revalidate" } }).then((res) => res.json());

  return query.Products.map((product) =>
    toProduct(ctx, product, {
      url,
      priceCurrency: "BRL",
    })
  );
};

export default productListLoader;
