/**
 * @title ABTest {{{percentage traffic}}}
 */
export interface Props {
  traffic: number;
}

// once selected the session will reuse the same value
export const sticky = "session";

// Sticky-session matchers persist the result in a deco_matcher_* cookie, and
// CDNs are expected to include that cookie in the cache key — so per-variant
// responses get distinct cache entries and the page is safely cacheable.
export const cacheable = true;

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

export const sessionKey = (props: Props) => {
  return `${props.traffic}`;
};
