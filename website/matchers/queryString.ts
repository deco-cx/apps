import { MatchContext } from "deco/blocks/matcher.ts";

interface BaseCase {
  value: string;
}

/**
 * @title Equals
 */
interface Equals extends BaseCase {
  /**
   * @ignore
   */
  type: "Equals";
}

interface Greater extends BaseCase {
  /**
   * @ignore
   */
  type: "Greater";
}

interface Lesser extends BaseCase {
  /**
   * @ignore
   */
  type: "Lesser";
}

interface GreaterOrEquals extends BaseCase {
  /**
   * @ignore
   */
  type: "GreaterOrEquals";
}

interface LesserOrEquals extends BaseCase {
  /**
   * @ignore
   */
  type: "LesserOrEquals";
}

interface Includes extends BaseCase {
  /**
   * @ignore
   */
  type: "Includes";
}

interface Exists {
  /**
   * @ignore
   */
  type: "Exists";
}

/*
 * @title {{{param}}} {{{case.type}}} {{{case.value}}}
 */
interface Condition {
  param: string;
  case:
    | Equals
    | Greater
    | Lesser
    | GreaterOrEquals
    | LesserOrEquals
    | Includes
    | Exists;
}

/**
 * @title Query String Matcher
 */
export interface Props {
  conditions: Condition[];
}

const matchesAtLeastOne = (
  params: string[],
  condition: Condition,
  compare: (a: string, b: string) => boolean,
) => {
  if (condition.case.type === "Exists") return false;

  const value = condition.case.value as string;

  return params.filter((param) => compare(param, value)).length > 0;
};

const operations: Record<
  Condition["case"]["type"],
  (param: string[], condition: Condition) => boolean
> = Object.freeze({
  Equals: (params, condition) =>
    matchesAtLeastOne(params, condition, (a, b) => a == b),
  Greater: (params, condition) =>
    matchesAtLeastOne(params, condition, (a, b) => a > b),
  GreaterOrEquals: (params, condition) =>
    matchesAtLeastOne(params, condition, (a, b) => a >= b),
  Includes: (params, condition) =>
    matchesAtLeastOne(params, condition, (a, b) => a.includes(b)),
  Lesser: (params, condition) =>
    matchesAtLeastOne(params, condition, (a, b) => a < b),
  LesserOrEquals: (params, condition) =>
    matchesAtLeastOne(params, condition, (a, b) => a <= b),
  Exists: (_params, _condition) => true,
});

/**
 * @title Query String
 */
const MatchQueryString = (
  props: Props,
  { request }: MatchContext,
) => {
  let matches = true;
  const url = new URL(request.url);

  props.conditions.forEach((condition) => {
    const params = url.searchParams.getAll(condition.param);
    if (!params.length) {
      matches = false;
      return;
    }

    matches = matches && operations[condition.case.type](params, condition);
  });

  return matches;
};

export default MatchQueryString;
