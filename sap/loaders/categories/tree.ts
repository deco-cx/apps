import type { SiteNavigationElement } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { CatalogsResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   *  @default FULL
   */
  fields?: string;
  /**
   * @description Filter when it's needed to retrieve only brands, collections or categories. Examples: categories, brands, collections
   */
  categoryType?: "default" | "categories" | "brands" | "collections";
}

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - Category tree loader
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SiteNavigationElement[] | null> => {
  const { api } = ctx;
  const { fields } = props;

  const data: CatalogsResponse = await api["GET /catalogs?:fields"](
    { fields },
  ).then(
    (res: Response) => res.json(),
  );
  const _tree = data.catalogs[0].catalogVersions
    .find((version) => {
      version.id == "Online";
    });

  return [{
    "@type": "SiteNavigationElement",
    additionalType: "",
    identifier: "",
    name: "",
    url: "",
  }];
};

export default loader;
