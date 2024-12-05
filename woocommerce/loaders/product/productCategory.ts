import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { Category } from "../../utils/types.ts";

export interface Props {
  slug?: RequestURLParam;
}

/**
 * @title WooCommerce Integration
 * @description Product Category loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Category | null> {
  const { slug } = props;
  const { api } = ctx;

  const urlPathname = new URL(req.url).pathname;

  const pathname = (slug || urlPathname).split("/").filter(Boolean).pop();

  if (!pathname) return null;

  const categories = await api["GET /wc/v3/products/categories"]({
    slug,
  }).then((res) => res.json());

  const category = categories.find((item) => item.slug === pathname);

  if (!category) return null;

  return category;
}

export default loader;
