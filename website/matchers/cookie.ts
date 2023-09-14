import { MatchContext } from "deco/blocks/matcher.ts";
import { getCookies } from "std/http/cookie.ts";

/**
 * @title Cookie
 */
export interface Props {
  name: string;
  value: string;
}

/**
 * @title Cookie Matcher
 */
const MatchCookie = (
  { name, value }: Props,
  { request }: MatchContext,
) => {
  const cookies = getCookies(request.headers);
  return cookies[name] === value;
};

export default MatchCookie;
