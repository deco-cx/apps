import { AppContext } from "../mod.ts";
import { Banner, PageType } from "../utils/typings.ts";

export interface Props {
  /**
   * @description Type of page you are setting up.
   */
  pageType: PageType;
  /**
   * @hide
   */
  pageIdentifier?: string;
  /**
   * @default padrao
   */
  channel: string;
}

/**
 * @title SmartHint Integration - Banners By Page
 * @description Autocomplete Loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Banner[] | null> => {
  const { api, shcode, cluster } = ctx;
  const { pageType, pageIdentifier: pageIdentifierProp, channel = "padrao" } =
    props;

  const url = new URL(req.url);

  const pageIdentifier = pageIdentifierProp ?? url.pathname;

  const data = await api["GET /:cluster/banner/bannerByPage"]({
    cluster,
    shcode,
    channel,
    pageIdentifier: pageIdentifier.replace("/", ""),
    pagetype: pageType,
  }).then((r) => r.json());

  return data;
};

export default loader;
