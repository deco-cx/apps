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
const MatchMulti = ({ op, matchers }: Props) => async (ctx: MatchContext) => {
  if (op === "or") {
    for (const matcher of matchers) {
      if (await matcher(ctx)) return true;
    }
    return false;
  } else {
    for (const matcher of matchers) {
      if (!await matcher(ctx)) return false;
    }
    return true;
  }
};
export default MatchMulti;

export const cacheable = true;
