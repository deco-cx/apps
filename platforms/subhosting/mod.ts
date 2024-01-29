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
      deployAccessToken: state.deployAccessToken?.get?.() ??
        Deno.env.get("DEPLOY_ACCESS_TOKEN"),
      deployOrgId: state.deployOrgId?.get?.() ?? Deno.env.get("DEPLOY_ORG_ID"),
      projectId: state.projectId,
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;
