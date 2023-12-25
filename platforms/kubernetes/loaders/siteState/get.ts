import { Domain } from "../../../../admin/platform.ts";
import { EnvVar } from "../../actions/deployments/create.ts";
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
export type Source = Github;
export interface SiteState {
  entrypoint?: string; // defaults to main.ts
  source: Source;
  runArgs?: string;
  runnerImage?: string;
  builderImage?: string;
  envVars?: EnvVar[];
  useServiceAccount?: boolean;
  scaling?: ServiceScaling;
  domains?: Domain[];
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
  const secret = await k8sApi.readNamespacedSecret(
    State.secretName,
    site,
  ).catch((err) => {
    if ((err as k8s.HttpError)?.statusCode === 404) {
      return undefined;
    }
    throw err;
  });
  return secret
    ? { ...ctx.defaultSiteState, ...State.fromSecret(secret.body)! }
    : undefined;
}
