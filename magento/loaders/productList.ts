import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  ProductShelfGraphQL,
  ProductSearchInputs,
  ProductSortInput,
  ProductFilterInput,
} from "../utils/clientGraphql/types.ts";
import { GetProduct } from "../utils/clientGraphql/queries.ts";
import { typeChecker } from "../utils/utils.ts";
import { toProductGraphQL } from "../utils/transform.ts";

export interface CommomProps {
  /**
   * @title Tamanho do conjunto
   * @default 8
   */
  pageSize: number;

  /**
   * @title Indice do conjunto
   * @default 1
   */
  currentPage: number;

  /** @title Ordenação */
  sort?: {
    /** @title Ordenar por */
    sortBy: "name" | "position" | "price" | "relevance";

    /** @title Sequência */
    order: "ASC" | "DESC";
  };

  /** @title Filtro */
  filter?: Array<FilterProps>;
}

export interface FilterProps {
  /** @title Nome do filtro */
  input: string;
  /**
   * @title Valores do filtro
   * TODO(aka-sacci-ccr): Mudar lógica dos fitros - Default Filters e Customizable filters
   */
  values: Array<string>;
}

export interface TermProps extends CommomProps {
  /** @title Termo */
  search: string;
}

export interface CategoryProps extends CommomProps {
  /** @title IDs das Categorias */
  categories: Array<string>;

  /** @title Usar Uid para mapear categorias */
  useCategoryUid: boolean;
}

export interface ProductSkuProps extends Omit<CommomProps, "filter"> {
  skus: Array<string>;
}

export interface SegmentProps extends CommomProps {
  /** @title Linhas */
  segments: Array<string>;
}

/**
 * @title Magento Integration - Product Lists
 */
export interface Props {
  props: TermProps | CategoryProps | ProductSkuProps | SegmentProps;
}

const transformSort = ({
  sort,
}: Pick<CommomProps, "sort">): ProductSortInput | undefined => {
  if (!sort?.sortBy) {
    return undefined;
  }
  return {
    [sort.sortBy]: sort?.order,
  };
};

const transformFilter = ({
  filter,
}: Pick<CommomProps, "filter">): ProductFilterInput | undefined => {
  return filter?.reduce<ProductFilterInput>((acc, f) => {
    return {
      ...acc,
      [f.input]: transformFilterValue(f),
    };
  }, {});
};

const transformFilterValue = ({ input, values }: FilterProps) => {
  //TODO(aka-sacci-ccr): melhorar isso
  if (input === "name") {
    return {
      match: values[0],
    };
  }
  return values.length === 1 ? { eq: values[0] } : { in: values.map((v) => v) };
};

const fromProps = ({ props }: Props): ProductSearchInputs => {
  if (typeChecker<TermProps>(props as TermProps, "search")) {
    const { search, filter } = props as TermProps;
    return {
      search,
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSort({ sort: props.sort }),
      filter: transformFilter({ filter }),
    } as const;
  }

  if (typeChecker<CategoryProps>(props as CategoryProps, "categories")) {
    const { filter, categories, useCategoryUid } = props as CategoryProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSort({ sort: props.sort }),
      filter: transformFilter({
        filter: filter?.concat([
          {
            input: useCategoryUid ? "category_uid" : "category_id",
            values: categories,
          },
        ]),
      }),
    } as const;
  }

  if (typeChecker<ProductSkuProps>(props as ProductSkuProps, "skus")) {
    const { skus } = props as ProductSkuProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSort({ sort: props.sort }),
      filter: transformFilter({
        filter: [
          {
            input: "sku",
            values: skus,
          },
        ],
      }),
    } as const;
  }

  if (typeChecker<SegmentProps>(props as SegmentProps, "segments")) {
    const { filter, segments } = props as SegmentProps;
    return {
      pageSize: props.pageSize,
      currentPage: props.currentPage,
      sort: transformSort({ sort: props.sort }),
      filter: transformFilter({
        filter: filter?.concat({
          input: "linha",
          values: segments,
        }),
      }),
    } as const;
  }

  throw new Error(`Unknown props: ${JSON.stringify(props)}`);
};

/**
 * @title Magento Integration - Product Listing loader
 */
async function loader(
  { props }: Props,
  req: Request,
  ctx: AppContext
): Promise<Product[] | null> {
  const { clientGraphql, imagesQtd } = ctx;
  const url = new URL(req.url);
  const formatedProps = fromProps({ props });
  try {
    const { products } = await clientGraphql.query<
      ProductShelfGraphQL,
      ProductSearchInputs
    >({
      variables: { ...formatedProps },
      ...GetProduct,
    });

    if (!products.items || products.items?.length === 0) {
      return null;
    }

    return products.items.map((p) => toProductGraphQL(p, url, imagesQtd));
  } catch (e) {
    console.log(e)
    return null;
  }
}

export default loader;
