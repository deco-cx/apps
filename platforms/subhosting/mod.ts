import type { App, AppContext as AC } from "deco/mod.ts";
import { Secret } from "../../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  deployAccessToken?: Secret;
  deployOrgId?: Secret;
  projectId?: string;
}

export interface State {
  deployAccessToken?: string;
  deployOrgId?: string;
  projectId?: string;
}

/**
 * @title Deno Subhosting
 */
export default function App(
  state: Props,
): App<Manifest, State> {
  return {
    manifest,
    state: {
      deployAccessToken: state.deployAccessToken?.get?.() ?? 'ddo_9CRjRBJ2bSVQvNBvZy1jYLECovQb3g1PbaUG',
      deployOrgId: state.deployOrgId?.get?.() ?? '9ff6a5d8-94bd-45d8-90b4-891ab889d548',
      projectId: state.projectId,
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
