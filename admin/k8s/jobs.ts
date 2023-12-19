import { k8s } from "../deps.ts";
import { deferred, delay } from "std/async/mod.ts";

export async function watchJobStatus(
  kc: k8s.KubeConfig,
  namespace: string,
  jobName: string,
  timeoutMs?: number,
): Promise<void> {
  const fieldSelector = `metadata.name=${jobName}`;
  const watcher = new k8s.Watch(kc);

  const result = deferred<void>();

  // Watch for changes to the Job status
  const req = await watcher.watch(
    `/apis/batch/v1/namespaces/${namespace}/jobs`,
    { fieldSelector },
    (type, obj) => {
      if (type === "MODIFIED" && obj.status && obj.status.conditions) {
        const conditions = obj.status.conditions;
        const jobComplete = conditions.some((cond: k8s.V1JobCondition) =>
          cond.type === "Complete" && cond.status === "True"
        );

        if (jobComplete) {
          result.resolve();
        }
      }
    },
    (err) => {
      if (err) {
        result.reject(err);
      } else {
        result.resolve();
      }
    },
  );

  if (timeoutMs) {
    delay(timeoutMs).then(() => {
      req.abort();
      result.reject({ message: "timed out" });
    });
  }

  return result;
}
