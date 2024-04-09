import { Domain } from "../../../../admin/platform.ts";
import { FileSystemNode } from "../../../../files/sdk.ts";
import { Namespace } from "../../actions/sites/create.ts";
import { EnvVar } from "../../common/knative/service.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
}

export const State = {
  secretName: "state",
  fromSecret: (secret: k8s.V1Secret): SiteState | undefined => {
    const siteB64Str = secret.data?.["state"];
    return siteB64Str ? JSON.parse(atob(siteB64Str)) : undefined;
  },
  toSecret: (
    namespace: string,
    state: SiteState,
  ): k8s.V1Secret => {
    return {
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name: State.secretName,
        namespace,
      },
      stringData: {
        state: JSON.stringify(state),
      },
    };
  },
};

export interface Concurrency {
  type: "concurrency";
  target: number;
}

export interface RPS {
  type: "rps";
  target: number;
}

export interface CPU {
  type: "cpu";
  target: number;
}

export interface Memory {
  type: "memory";
  target: number;
}

export type ScaleMetric = Concurrency | CPU | Memory | RPS;

export interface ServiceScaling {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  retentionPeriod?: string;
  metric?: ScaleMetric;
}

export interface Github {
  type: "github";
  repo: string;
  owner: string;
  commitSha: string;
}

export interface Files {
  type: "files";
  files: FileSystemNode;
}

export type Source = Github | Files;

export const sourceIsFromFiles = (source: Source): source is Files => {
  return (source?.type ?? "github") === "files";
};

export interface Resource {
  cpu?: string;
  memory?: string;
  "ephemeral-storage"?: string;
}
export interface ResourceRequirements {
  requests?: Resource;
  limits?: Resource;
}

export type NodeSelector = Record<string, string>;

export const NODE_LABELS_KEY = {
  "DECO_EVENT": "deco.event",
};

export const NODE_LABELS_VALUES = {
  [NODE_LABELS_KEY.DECO_EVENT]: {
    "PRODUCT_HUNT": "product-hunt",
  },
};

export interface SiteState {
  entrypoint?: string; // defaults to main.ts
  source?: Source;
  runArgs?: string;
  runnerImage?: string;
  builderImage?: string;
  envVars?: EnvVar[];
  useServiceAccount?: boolean;
  scaling?: ServiceScaling;
  resources?: ResourceRequirements;
  domains?: Domain[];
  nodeSelector?: NodeSelector;
  nodeAffinity?: k8s.V1NodeAffinity;
}

/**
 * Returns the current site state.
 * @title Site State
 */
export default async function getSiteState(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SiteState | undefined> {
  const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const siteNs = Namespace.forSite(site);
  const secret = await k8sApi.readNamespacedSecret(
    State.secretName,
    siteNs,
  ).catch(async (err) => {
    if ((err as k8s.HttpError)?.statusCode === 404) {
      await ctx.invoke.kubernetes.actions.sites.create({ site }); // create site on 404
      return undefined;
    }
    throw err;
  });
  return secret ? State.fromSecret(secret.body) : undefined;
}
