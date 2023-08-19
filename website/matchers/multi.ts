import {
  MatchContext,
  Matcher,
} from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/matcher.ts";

/**
 * @title Combined options with {{{op}}}
 */
export interface Props {
  op: "or" | "and";
  matchers: Matcher[];
}

/**
 * @title OR & AND Matcher
 */
const MatchMulti = ({ op, matchers }: Props) => (ctx: MatchContext) => {
  return op === "or"
    ? matchers.some((matcher) => matcher(ctx))
    : matchers.every((matcher) => matcher(ctx));
};

export default MatchMulti;
