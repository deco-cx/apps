import { context } from "deco/live.ts";
import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { k8s } from "./deps.ts";
import { SiteState } from "./loaders/siteState/get.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";

const DEFAULT_BUILDER_IMAGE =
  "578348582779.dkr.ecr.sa-east-1.amazonaws.com/deco-sites:builder-latest-158bdf1cfdba357c995ef9613c3312c76567eed4461d8f33fb2256a342d0e105";
const DEFAULT_RUNNER_IMAGE =
  "578348582779.dkr.ecr.sa-east-1.amazonaws.com/deco-sites:runner-latest-e18bba14a8fc9c2f5d5297daebc37106e1ab23d6ae31be9fc1a3bf5f857e27af";
export const CONTROL_PLANE_DOMAIN = "decocdn.com";

export interface State {
  kc: k8s.KubeConfig;
  defaultSiteState: Partial<SiteState>;
  controlPlaneDomain: string;
}

export interface Props {
  defaultSiteState?: Partial<SiteState>;
}

/**
 * @title Admin
 */
export default function App(
  {
    defaultSiteState,
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
      controlPlaneDomain: CONTROL_PLANE_DOMAIN,
      defaultSiteState: defaultSiteState ?? {
        runnerImage: DEFAULT_RUNNER_IMAGE,
        builderImage: DEFAULT_BUILDER_IMAGE,
        scaling: {
          maxScale: 100,
          initialScale: 3,
          minScale: 0,
          retentionPeriod: "5m",
        },
      },
    },
  };
}

export type AppContext = AC<ReturnType<typeof App>>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;
