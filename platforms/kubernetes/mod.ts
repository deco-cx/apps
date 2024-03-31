import { context } from "deco/live.ts";
import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { Secret } from "../../website/loaders/secret.ts";
import { k8s } from "./deps.ts";
import { SiteState } from "./loaders/siteState/get.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";

// TODO (mcandeia) use decosite export const CONTROL_PLANE_DOMAIN = "deco.site";
export const CONTROL_PLANE_DOMAIN = "decocdn.com";

export interface State {
  kc: k8s.KubeConfig;
  withDefaults: (siteState: SiteState) => SiteState;
  controlPlaneDomain: string;
  githubToken?: string;
}

export interface Props {
  defaultSiteState?: SiteState;
  githubToken?: Secret;
}

/**
 * @title Admin
 */
export default function App(
  {
    defaultSiteState,
    githubToken,
  }: Props,
): App<AppManifest, State> {
  const kc = new k8s.KubeConfig();
  if (!context.play) {
    try {
      context.isDeploy ? kc.loadFromCluster() : kc.loadFromDefault();
    } catch (err) {
      console.error("couldn't not load from kuberentes state", err);
    }
  }
  // It is a default state for a production site
  const _defaultSiteState = {
    ...defaultSiteState ?? {},
    scaling: {
      ...defaultSiteState?.scaling ?? {},
      maxScale: 20,
      initialScale: 1,
      minScale: 0,
      retentionPeriod: "10m",
    },
    resources: {
      ...defaultSiteState?.resources ?? {},
      limits: {
        ...defaultSiteState?.resources?.limits ?? {},
        memory: "1536Mi",
        "ephemeral-storage": "2Gi",
      },
      requests: {
        ...defaultSiteState?.resources?.requests ?? {},
        memory: "512Mi",
        "ephemeral-storage": "1Gi",
      },
    },
  };

  return {
    manifest,
    state: {
      kc,
      githubToken: githubToken?.get?.() ?? Deno.env.get("OCTOKIT_TOKEN"),
      controlPlaneDomain: CONTROL_PLANE_DOMAIN,
      withDefaults: (state) => ({
        ..._defaultSiteState,
        ...state,
        envVars: [..._defaultSiteState.envVars ?? [], ...state?.envVars ?? []],
      }),
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;
