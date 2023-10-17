export interface Props {
  label?: string;
}

/**
 * @title Never
 */
const MatchNever = (_props: Props) => {
  return false;
};

export default MatchNever;
