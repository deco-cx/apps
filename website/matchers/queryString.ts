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

    switch (condition.case.type) {
      case "Equals":
        matches = matches &&
          matchesAtLeastOne(params, condition, (a, b) => a == b);
        break;
      case "Greater":
        matches = matches &&
          matchesAtLeastOne(params, condition, (a, b) => a > b);
        break;
      case "Lesser":
        matches = matches &&
          matchesAtLeastOne(params, condition, (a, b) => a < b);
        break;
      case "GreaterOrEquals":
        matches = matches &&
          matchesAtLeastOne(params, condition, (a, b) => a >= b);
        break;
      case "LesserOrEquals":
        matches = matches &&
          matchesAtLeastOne(params, condition, (a, b) => a <= b);
        break;
      case "Includes":
        matches = matches &&
          matchesAtLeastOne(params, condition, (a, b) => a.includes(b));
        break;
      case "Exists":
        matches = matches && true;
        break;
    }
  });

  return matches;
};

export default MatchQueryString;
