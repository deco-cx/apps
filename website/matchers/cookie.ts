import { getCookies } from "std/http/cookie.ts";
import { type MatchContext } from "@deco/deco/blocks";
/**
 * @title Cookie
 */
export interface Props {
  name: string;
  value: string;
}
/**
 * @title Cookie
 * @description Target users that have a specific cookie
 * @icon cookie
 */
const MatchCookie = ({ name, value }: Props, { request }: MatchContext) => {
  const cookies = getCookies(request.headers);
  return cookies[name] === value;
};
export default MatchCookie;
