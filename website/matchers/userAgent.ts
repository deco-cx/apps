import { type MatchContext } from "@deco/deco/blocks";
/**
 * @title {{{includes}}} {{{match}}}
 */
export interface Props {
  includes?: string;
  match?: string;
}
/**
 * @title User Agent
 * @description Target users based on their web browser or operational system
 * @icon world
 */
const MatchUserAgent = (
  { includes, match }: Props,
  { request }: MatchContext,
) => {
  const ua = request.headers.get("user-agent") || "";
  const regexMatch = match ? new RegExp(match).test(ua) : true;
  const includesFound = includes ? ua.includes(includes) : true;
  return regexMatch && includesFound;
};
export default MatchUserAgent;

// Deterministic per UA (same input → same result), and the framework's edge
// already discriminates by device/UA when needed (see `device.ts`, also
// cacheable). Marking this cacheable lets pages that use UA-based bot/browser
// splits stay cacheable instead of being globally killed by the
// `allFlagsCacheable` gate in deco runtime middleware.
export const cacheable = true;
