import type { SiteNavigationElement } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { FieldsList } from "../../utils/client/types.ts";

export interface Props {
  /**
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   *  @default DEFAULT
   */
  fields?: FieldsList;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SiteNavigationElement[] | null> => {
  const { api } = ctx;
  const { fields = "DEFAULT" } = props;

  const data = await api["GET /catalogs?:fields"]({ fields }, STALE).then(
    (res) => res.json(),
  );

  const tree = data.catalogs[0].catalogVersions
    .find((version) => {
      version.id == "Online";
    })
    .categories.find((category) => {
      category.id === "collections";
    });

  return tree;
};

export default loader;
