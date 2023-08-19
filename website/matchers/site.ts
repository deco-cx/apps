import { MatchContext } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/matcher.ts";

/**
 * @title {{{siteId}}}
 */
export interface Props {
  siteId: number;
}

/**
 * @title Site Matcher
 */
const MatchSite = ({ siteId }: Props, { siteId: currSiteId }: MatchContext) => {
  return siteId === currSiteId;
};

export default MatchSite;
