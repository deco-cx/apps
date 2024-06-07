import { AppContext } from "../mod.ts";
import { Banner, PageType } from "../utils/typings.ts";

export interface Props {
  pageType: PageType;
  pageIdentifier: string;
  channel: string;
}

/**
 * @title Smarthint Integration
 * @description Autocomplete Loader
 */
const loader = async (
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

export default loader;
