import { MatchContext } from "deco/blocks/matcher.ts";

/**
 * @title {{{siteId}}}
 */
export interface Props {
  siteId: number;
}

/**
 * @title Site
 * @description Target users based on the deco website ID they are on
 * @icon hand-click
 */
const MatchSite = ({ siteId }: Props, { siteId: currSiteId }: MatchContext) => {
  return siteId === currSiteId;
};

export default MatchSite;
