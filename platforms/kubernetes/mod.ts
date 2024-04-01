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

const PREVIEW_SERVICE_RESOURCES: ResourceRequirements = {
  limits: { memory: "1280Mi", "ephemeral-storage": "1Gi" },
  requests: { memory: "512Mi", "ephemeral-storage": "512Mi" },
};

const PRODUCTION_SERVICE_SCALING: ServiceScaling = {
  maxScale: 20,
  initialScale: 1,
  minScale: 0,
  retentionPeriod: "10m",
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
  withDefaults: (siteState: SiteState, production: boolean) => SiteState;
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

  return {
    manifest,
    state: {
      kc,
      githubToken: githubToken?.get?.() ?? Deno.env.get("OCTOKIT_TOKEN"),
      controlPlaneDomain: CONTROL_PLANE_DOMAIN,
      withDefaults: (state, production) => {
        const scaling = buildSiteScaling(
          defaultSiteState?.scaling,
          state?.scaling,
          production,
        );
        const resources = buildSiteResources(
          defaultSiteState?.resources,
          state?.resources,
          production,
        );

        return {
          ...defaultSiteState,
          ...state,
          scaling,
          resources,
          envVars: [
            ...defaultSiteState?.envVars ?? [],
            ...state?.envVars ?? [],
          ],
        };
      },
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;

function buildSiteScaling(
  defaultSiteScaling: ServiceScaling | undefined,
  stateScaling: ServiceScaling | undefined,
  production: boolean,
) {
  return {
    ...defaultSiteScaling ?? {},
    ...(production ? PRODUCTION_SERVICE_SCALING : {}),
    ...stateScaling ?? {},
    ...(!production ? PREVIEW_SERVICE_SCALING : {}),
  };
}

function buildSiteResources(
  defaultSiteResources: ResourceRequirements | undefined,
  stateResources: ResourceRequirements | undefined,
  production: boolean,
) {
  return {
    requests: {
      ...defaultSiteResources?.requests ?? {},
      ...(production ? PRODUCTION_SERVICE_RESOURCES.requests : {}),
      ...stateResources?.requests ?? {},
      ...(!production ? PREVIEW_SERVICE_RESOURCES.requests : {}),
    },
    limits: {
      ...defaultSiteResources?.limits ?? {},
      ...(production ? PRODUCTION_SERVICE_RESOURCES.limits : {}),
      ...stateResources?.limits ?? {},
      ...(!production ? PREVIEW_SERVICE_RESOURCES.limits : {}),
    },
  };
}
