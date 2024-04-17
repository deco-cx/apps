import { context } from "deco/live.ts";
import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { Secret } from "../../website/loaders/secret.ts";
import { k8s } from "./deps.ts";
import {
  ResourceRequirements,
  ServiceScaling,
  SiteState,
} from "./loaders/siteState/get.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";

export const PREVIEW_SERVICE_SCALING: ServiceScaling = {
  maxScale: 1,
  initialScale: 1,
  minScale: 0,
  retentionPeriod: "5m",
};

export const PREVIEW_SERVICE_RESOURCES: ResourceRequirements = {
  limits: { memory: "1280Mi", "ephemeral-storage": "1Gi" },
  requests: { memory: "512Mi", "ephemeral-storage": "512Mi" },
};

const PRODUCTION_SERVICE_SCALING: ServiceScaling = {
  maxScale: 20,
  initialScale: 1,
  minScale: 0,
  retentionPeriod: "5m",
};

const PRODUCTION_SERVICE_RESOURCES: ResourceRequirements = {
  limits: {
    memory: "1536Mi",
    "ephemeral-storage": "2Gi",
  },
  requests: {
    memory: "512Mi",
    "ephemeral-storage": "1Gi",
  },
};

// TODO (mcandeia) use decosite export const CONTROL_PLANE_DOMAIN = "deco.site";
export const CONTROL_PLANE_DOMAIN = "decocdn.com";

export interface State {
  kc: k8s.KubeConfig;
  withBaseState: (siteState: SiteState) => SiteState;
  controlPlaneDomain: string;
  githubToken?: string;
}

export interface Props {
  baseSiteState?: SiteState;
  githubToken?: Secret;
}

/**
 * @title Admin
 */
export default function App(
  {
    baseSiteState,
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

  // It is a base state for a production site
  const _baseSiteState = {
    ...baseSiteState ?? {},
    scaling: {
      ...baseSiteState?.scaling ?? {},
      ...PRODUCTION_SERVICE_SCALING,
    },
    resources: {
      ...baseSiteState?.resources ?? {},
      limits: {
        ...baseSiteState?.resources?.limits ?? {},
        ...PRODUCTION_SERVICE_RESOURCES.limits,
      },
      requests: {
        ...baseSiteState?.resources?.requests ?? {},
        ...PRODUCTION_SERVICE_RESOURCES.requests,
      },
    },
  };

  return {
    manifest,
    state: {
      kc,
      githubToken: githubToken?.get?.() ?? Deno.env.get("OCTOKIT_TOKEN"),
      controlPlaneDomain: CONTROL_PLANE_DOMAIN,
      withBaseState: (state) => {
        const scaling = mergeSiteScaling(
          _baseSiteState?.scaling,
          state?.scaling,
        );
        const resources = mergeSiteResources(
          _baseSiteState?.resources,
          state?.resources,
        );

        return {
          ..._baseSiteState,
          ...state,
          scaling,
          resources,
          envVars: [
            ..._baseSiteState?.envVars ?? [],
            ...state?.envVars ?? [],
          ],
        };
      },
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;

function mergeSiteScaling(
  baseSiteState: ServiceScaling | undefined,
  stateScaling: ServiceScaling | undefined,
) {
  return {
    ...baseSiteState ?? {},
    ...stateScaling ?? {},
  };
}

function mergeSiteResources(
  baseSiteState: ResourceRequirements | undefined,
  stateResources: ResourceRequirements | undefined,
) {
  return {
    requests: {
      ...baseSiteState?.requests ?? {},
      ...stateResources?.requests ?? {},
    },
    limits: {
      ...baseSiteState?.limits ?? {},
      ...stateResources?.limits ?? {},
    },
  };
}
