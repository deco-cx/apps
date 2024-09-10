import { DefaultPathProps } from "../../../website/pages/Page.tsx";
import { AppContext } from "../../mod.ts";
import productList from "../legacy/productList.ts";

export interface Props {
  count: number;
}

const loader = async (
  props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<DefaultPathProps | null> => {
  const { count = 5 } = props as Props;

  const response = await productList(
    {
      props: {
        term: "",
        count,
        sort: "OrderByTopSaleDESC",
      },
    },
    req,
    ctx,
  );

  const defaultPaths = response?.map((p) => {
    if (p.url) {
      const url = new URL(p.url);
      return url.href.replace(url.origin, "").substring(1).split("/p")[0];
    }
  });

  return {
    possiblePaths: defaultPaths as string[],
  };
};

export default loader;
