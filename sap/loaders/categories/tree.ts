import type { SiteNavigationElement } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { FieldsList } from "../../utils/types.ts";

export interface Props {
  /**
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   *  @default DEFAULT
   */
  fields?: FieldsList;
  /**
   * @description Filter when it's needed to retrieve only brands, collections or categories. Examples: categories, brands, collections
   */
  categoryType?: "default" | "categories" | "brands" | "collections";
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SiteNavigationElement[] | null> => {
  const { api } = ctx;
  const { categoryType, fields } = props;

  const data = await api["GET /catalogs?:fields"]({ fields }, STALE).then(
    (res) => res.json(),
  );

  let tree = data.catalogs[0].catalogVersions
    .find((version) => {
      version.id == "Online";
    });

  if (categoryType && categoryType !== "default") {
    tree = tree.categories.find((category) => {
      category.id === categoryType;
    });
  }

  return tree;
};

export default loader;
