import { k8s } from "../../deps.ts";
import { watchCondition } from "../watcher.ts";

export interface RouteCondition {
  lastTransitionTime: Date;
  status: "True" | "False";
  type:
    | "AllTrafficAssigned"
    | "CertificateProvisioned"
    | "IngressReady"
    | "Ready";
  reason: string;
}
export interface RouteTraffic {
  latestRevision: boolean;
  percent: number;
  revisionName: string;
}
export interface RouteStatus {
  address: {
    url: string;
  };
  conditions: RouteCondition[];
  url: string;
  traffic: RouteTraffic[];
}
export type Route =
  & { status: RouteStatus }
  & k8s.KubernetesObjectWithSpec
  & ReturnType<typeof revisionRoute>;

export interface RouteOpts {
  namespace: string;
  routeName: string;
  revisionName: string;
}

export const waitToBeReady = (
  kc: k8s.KubeConfig,
  { namespace, routeName: name, revisionName }: RouteOpts,
) => {
  return watchCondition<Route>(kc, name, {
    path: `/apis/serving.knative.dev/v1/namespaces/${namespace}/routes`,
    timeoutMs: 300_000,
    conditionMet: (_type, obj) => {
      const isReady = (obj?.status?.conditions ?? []).some((condition) =>
        condition.type === "Ready" && condition.status === "True"
      );
      return isReady && (obj?.status.traffic ?? []).some((traffic) => {
        return traffic.revisionName === revisionName;
      });
    },
  });
};

export const revisionRoute = (
  { namespace, routeName: name, revisionName }: RouteOpts,
) => {
  return {
    apiVersion: "serving.knative.dev/v1",
    kind: "Route",
    metadata: {
      name,
      namespace,
    },
    spec: {
      traffic: [
        {
          revisionName,
          percent: 100, // All traffic goes to this revision
        },
      ],
    },
  };
};
