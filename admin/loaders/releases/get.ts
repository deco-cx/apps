import { fetchState } from "../../actions/releases/fork.ts";
import { State } from "../../types.ts";

interface Props {
  name: string;
}

/** TODO(@gimenes): Implement fetching the state from the proper environment name */
const action = async (_props: Props): Promise<State["decofile"]> => {
  const { decofile } = await fetchState();

  return decofile;
};

export default action;
