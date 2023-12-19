import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export interface RunnerConfig {
  image: string;
}
const BUILDER_CONFIG_NAME = "runner-config";
export default async function getBuilderConfig(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<RunnerConfig> {
  const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const config = await k8sApi.readNamespacedConfigMap(
    BUILDER_CONFIG_NAME,
    ctx.workloadNamespace,
  );
  return config.body.data as unknown as RunnerConfig;
}
