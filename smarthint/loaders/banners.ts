import { AppContext } from "../mod.ts";
import { Banner, PageType } from "../utils/typings.ts";

export interface Props {
  pageType: PageType;
  /**
   * @hide
   */
  pageIdentifier?: string;
  channel: string;
}

/**
 * @title Smarthint Integration - Banners
 * @description Autocomplete Loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Banner[] | null> => {
  const { api, shcode, cluster } = ctx;
  const { pageType, pageIdentifier: pageIdentifierProp, channel } = props;

  const url = new URL(req.url);

  const pageIdentifier = pageIdentifierProp ?? url.hostname == "localhost"
    ? ""
    : new URL(url.pathname, url.origin)?.href.replace("/smarthint", ""); // todo remove

  const data = await api["GET /:cluster/banner/bannerByPage"]({
    cluster,
    shcode,
    channel,
    pageIdentifier,
    pagetype: pageType,
  }).then((r) => r.json());

  return data;
};

export default loader;
