import { type MatchContext, type Matcher } from "@deco/deco/blocks";
export interface Props {
  /**
   * @description Matcher to be negated.
   */
  matcher: Matcher;
}
/**
 * @title Negates
 * @description Create conditions that target users who do not meet certain criteria
 * @icon minus
 */
const NegateMatcher = ({ matcher }: Props) => async (ctx: MatchContext) => {
  return !(await matcher(ctx));
};

export default NegateMatcher;

export const cacheable = true;
