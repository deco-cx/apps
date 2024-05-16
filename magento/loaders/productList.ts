import type { ProductDetailsPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  GraphQLProductShelf,
  GraphQLProductShelfInputs,
  GraphQLProductSortInput,
  GraphQLProductFilterInput,
} from "../utils/clientGraphql/types.ts";
import { GetProduct } from "../utils/clientGraphql/queries.ts";
import { typeChecker } from "../utils/utils.ts";

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
   * @description Caso o filtro for "name", apenas o primeiro valor informado será considerado
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

export interface Props {
  props: TermProps | CategoryProps | ProductSkuProps | SegmentProps;
}

const transformSort = ({
  sort,
}: Pick<CommomProps, "sort">): GraphQLProductSortInput | undefined => {
  if (!sort?.sortBy) {
    return undefined;
  }
  return {
    [sort.sortBy]: sort?.order,
  };
};

const transformFilter = ({
  filter,
}: Pick<CommomProps, "filter">): GraphQLProductFilterInput | undefined => {
  return filter?.reduce<GraphQLProductFilterInput>((acc, f) => {
    return {
      ...acc,
      [f.input]: transformFilterValue(f),
    };
  }, {});
};

const transformFilterValue = ({ input, values }: FilterProps) => {
  if (input === "name") {
    return {
      match: values[0],
    };
  }
  return values.length === 1 ? { eq: values[0] } : { in: values.map((v) => v) };
};

const fromProps = ({ props }: Props): GraphQLProductShelfInputs => {
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
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<ProductDetailsPage | null> {
  const { clientGraphql } = ctx;
  const formatedProps = fromProps({ props: props.props });
  try {
    const data = await clientGraphql.query<
      GraphQLProductShelf,
      GraphQLProductShelfInputs
    >({
      variables: { ...formatedProps },
      ...GetProduct,
    });
    //TODO(@aka-sacci-ccr): toGraphQLProduct
    console.log(data);
  } catch (error) {
    console.log(error);
    return null;
  }

  return null;
}

export default loader;
