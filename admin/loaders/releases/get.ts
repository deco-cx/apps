import { fetchState } from "../../actions/releases/fork.ts";
import { AppContext } from "../../mod.ts";
import { State } from "../../types.ts";

export interface Props {
  /** Site name */
  site: string;
  /** Environment name */
  name?: string;
  /** Revision etag value */
  revision?: string;
}

export interface Returns {
  site: string;
  name?: string;
  blocks: State["decofile"];
  revision: State["revision"];
  revisions: unknown;
}

/** TODO(@gimenes): Implement fetching the state from the proper environment name */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Returns> => {
  const state = await fetchState(ctx.release());

  return {
    site: props.site,
    name: props.name,
    blocks: state.decofile,
    revision: state.revision,
    revisions: {},
  };
};

export default loader;
