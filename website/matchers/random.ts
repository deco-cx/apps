/**
 * @title ABTest {{{percentage traffic}}}
 */
export interface Props {
  traffic: number;
  label?: string;
}

// once selected the session will reuse the same value
export const sticky = "session";

/**
 * @title Random Matcher
 */
const MatchRandom = ({ traffic }: Props) => {
  return Math.random() < traffic;
};

export default MatchRandom;
