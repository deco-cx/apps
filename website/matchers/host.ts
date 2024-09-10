import { MatchContext } from "deco/blocks/matcher.ts";

/**
 * @title {{{includes}}} {{{match}}}
 */
export interface Props {
  includes?: string;
  match?: string;
}

/**
 * @title Host
 * @description Target users based on the domain or subdomain they are accessing your site from
 * @icon world-www
 */
const MatchHost = (
  { includes, match }: Props,
  { request }: MatchContext,
) => {
  const host = request.headers.get("host") || request.headers.get("origin") ||
    "";
  const regexMatch = match ? new RegExp(match).test(host) : true;
  const includesFound = includes ? host.includes(includes) : true;

  return regexMatch && includesFound;
};

export default MatchHost;
