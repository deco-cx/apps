import { k8s } from "../deps.ts";

import { watchCondition } from "./watcher.ts";

export function watchJobStatus(
  kc: k8s.KubeConfig,
  namespace: string,
  jobName: string,
  timeoutMs?: number,
): Promise<k8s.V1Job | null> {
  return watchCondition(kc, jobName, {
    path: `/apis/batch/v1/namespaces/${namespace}/jobs`,
    conditionMet: (_type, obj) => {
      if (obj.status && obj.status.conditions) {
        const conditions = obj.status.conditions;
        const condition: k8s.V1JobCondition | undefined = (conditions ?? [])
          .find((
            cond: k8s.V1JobCondition,
          ) => cond.status === "True");

        if (condition !== undefined) {
          return true;
        }
      }
      return false;
    },
    timeoutMs,
  });
}
