import { type MatchContext } from "@deco/deco/blocks";
interface BaseCase {
  /**
   * @title Pathname
   * @description Must start with "/"
   */
  pathname?: string;
  /**
   * @title Negate
   * @description Inverts the match result (NOT)
   * @default false
   */
  negate?: boolean;
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

interface Template extends BaseCase {
  /**
   * @readonly
   * @hide true
   */
  type: "Template";
}
export interface Props {
  /**
   * @title Operation
   */
  case: Equals | Includes | Template;
}
const operations: Record<
  Props["case"]["type"],
  (pathname: string, condition: string) => boolean
> = Object.freeze({
  Equals: (pathname, value) => pathname === value,
  Includes: (pathname, value) => pathname.includes(value),
  Template: (pathname, template) => {
    // Convert template like "/:slug/p" to regex pattern
    const pattern = template.replace(/:[^/]+/g, "([^/]+)");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  },
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
  const result = operations[props.case.type](pathname, props.case.pathname);
  return props.case.negate ? !result : result;
};
export default MatchPathname;
