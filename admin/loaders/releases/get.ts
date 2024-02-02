import { fetchState } from "../../actions/releases/fork.ts";
import { State } from "../../types.ts";

interface Props {
  /** Site name */
  site: string;
  /** Environment name */
  name?: string;
  /** Revision etag value */
  revision?: string;
}

/** TODO(@gimenes): Implement fetching the state from the proper environment name */
const loader = async (_props: Props): Promise<State["decofile"]> => {
  const { decofile } = await fetchState();

  return decofile;
};

export default loader;
