/**
 * @title ABTest {{{percentage traffic}}}
 */
export interface Props {
  traffic: number;
}

// once selected the session will reuse the same value
export const sticky = "session";

/**
 * @title Random
 * @description Target a percentage of the total traffic to do an A/B test
 * @icon arrow-split
 */
const MatchRandom = (
  { traffic }: Props,
) => {
  return Math.random() < traffic;
};

export default MatchRandom;
