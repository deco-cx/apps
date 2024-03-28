import { delay } from "std/async/mod.ts";
import { k8s } from "../deps.ts";

export interface WatchOptions<T> {
  timeoutMs?: number;
  path: string;
  conditionMet: (type: string, obj: T) => boolean;
}
export async function watchCondition<T>(
  kc: k8s.KubeConfig,
  objectName: string,
  options: WatchOptions<T>,
): Promise<T | null> {
  const fieldSelector = `metadata.name=${objectName}`;
  const watcher = new k8s.Watch(kc);

  const { resolve, reject, promise } = Promise.withResolvers<
    T | null
  >();
  let lastSeenJob: T | null = null;

  // Watch for changes to the Job status
  const req = await watcher.watch(
    options.path,
    { fieldSelector },
    (type, obj) => {
      lastSeenJob = obj;
      if (options.conditionMet(type, obj as T)) {
        resolve(lastSeenJob);
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

  if (options.timeoutMs) {
    delay(options.timeoutMs).then(() => {
      req.abort();
      reject({ message: "watch timed out" });
    });
  }

  return promise;
}
