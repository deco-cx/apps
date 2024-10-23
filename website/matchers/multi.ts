import { type MatchContext, type Matcher } from "@deco/deco/blocks";
/**
 * @title Combined options with {{{op}}}
 */
export interface Props {
  op: "or" | "and";
  matchers: Matcher[];
}
/**
 * @title Multi
 * @description Create more complex conditions by combining multiple matchers
 * @icon plus
 */
const MatchMulti = ({ op, matchers }: Props) => (ctx: MatchContext) => {
  return op === "or"
    ? matchers.some((matcher) => matcher(ctx))
    : matchers.every((matcher) => matcher(ctx));
};
export default MatchMulti;
