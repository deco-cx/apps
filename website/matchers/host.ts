import { MatchContext } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/matcher.ts";

/**
 * @title {{{includes}}} {{{match}}}
 */
export interface Props {
  includes?: string;
  match?: string;
}

/**
 * @title Host Matcher
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
