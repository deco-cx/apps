import { AppContext } from "../mod.ts";
import { PageType } from "../utils/typings.ts";

export interface Banner {
  Name?: string;
  UrlBanner?: string;
  UrlRedirect?: string;
  NewTab?: string;
  Sequence?: number;
  BannerHtml?: string;
}

export interface Props {
  pageType: PageType;
  pageIdentifier: string;
  channel: string;
}

/**
 * @title Smarthint Integration
 * @description Autocomplete Loader
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Banner[] | null> => {
  const { api, shcode, cluster } = ctx;
  const { pageType, pageIdentifier, channel } = props;

  const data = await api["GET /:cluster/banner/bannerByPage"]({
    cluster,
    shcode,
    channel,
    pageIdentifier,
    pagetype: pageType,
  }).then((r) => r.json());

  return data;
};

export default action;
