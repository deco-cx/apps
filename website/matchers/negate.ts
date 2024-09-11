import { MatchContext, Matcher } from "deco/blocks/matcher.ts";

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
