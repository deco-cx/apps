import { delay } from "std/async/mod.ts";
import { k8s } from "../deps.ts";

export async function watchJobStatus(
  kc: k8s.KubeConfig,
  namespace: string,
  jobName: string,
  timeoutMs?: number,
): Promise<k8s.V1Job | null> {
  const fieldSelector = `metadata.name=${jobName}`;
  const watcher = new k8s.Watch(kc);

  const { resolve, reject, promise } = Promise.withResolvers<
    k8s.V1Job | null
  >();
  let lastSeenJob: k8s.V1Job | null = null;

  // Watch for changes to the Job status
  const req = await watcher.watch(
    `/apis/batch/v1/namespaces/${namespace}/jobs`,
    { fieldSelector },
    (type, obj) => {
      lastSeenJob = obj;
      if (type === "MODIFIED" && obj.status && obj.status.conditions) {
        const conditions = obj.status.conditions;
        const condition: k8s.V1JobCondition = (conditions ?? []).find((
          cond: k8s.V1JobCondition,
        ) => cond.status === "True");

        if (condition !== undefined) {
          resolve(lastSeenJob);
        }
      }
    },
    (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(lastSeenJob);
      }
    },
  );

  if (timeoutMs) {
    delay(timeoutMs).then(() => {
      req.abort();
      reject({ message: "watch timed out" });
    });
  }

  return promise;
}
