import { MatchContext } from "deco/blocks/matcher.ts";

/**
 * @title {{{pathname}}}
 */
export interface Props {
  pathname: string;
}

/**
 * @title Pathname
 * @description Target users based on the pathname
 * @icon world-www
 */
const MatchPathname = (
  props: Props,
  { request }: MatchContext,
) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  return pathname.indexOf(props.pathname) !== -1;
};

export default MatchPathname;
