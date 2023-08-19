import { MatchContext } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/matcher.ts";

/**
 * @title {{{includes}}} {{{match}}}
 */
export interface Props {
  includes?: string;
  match?: string;
}

/**
 * @title User Agent Matcher
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
