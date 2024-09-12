import { type MatchContext } from "@deco/deco/blocks";
interface BaseCase {
  /**
   * @title Pathname
   * @description Must start with "/"
   */
  pathname?: string;
}
/**
 * @title Equals
 */
interface Equals extends BaseCase {
  /**
   * @readonly
   * @hide true
   */
  type: "Equals";
}
interface Includes extends BaseCase {
  /**
   * @readonly
   * @hide true
   */
  type: "Includes";
}
export interface Props {
  /**
   * @title Operation
   */
  case: Equals | Includes;
}
const operations: Record<
  Props["case"]["type"],
  (pathname: string, condition: string) => boolean
> = Object.freeze({
  Equals: (pathname, value) => pathname === value,
  Includes: (pathname, value) => pathname.includes(value),
});
/**
 * @title Pathname
 * @description Target users based on the pathname
 * @icon world-www
 */
const MatchPathname = (props: Props, { request }: MatchContext) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (!props.case.pathname) {
    return false;
  }
  return operations[props.case.type](pathname, props.case.pathname);
};
export default MatchPathname;
