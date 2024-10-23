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
const NegateMacher = ({ matcher }: Props) => (ctx: MatchContext) => {
  return !matcher(ctx);
};
export default NegateMacher;
