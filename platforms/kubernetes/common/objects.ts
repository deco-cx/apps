import { k8s } from "../deps.ts";

export interface K8sObject {
  metadata: {
    name: string;
    namespace: string;
    annotations?: Record<string, string>;
    resourceVersion?: string;
  };
}

export const ignoreIfExists = (err: unknown) => {
  if (
    (err as k8s.HttpError)?.statusCode === 409 &&
    (err as k8s.HttpError)?.body?.reason === "AlreadyExists"
  ) {
    return undefined;
  }
  throw err;
};

export const undefinedIfNotExists = (err: unknown) => {
  if (
    (err as k8s.HttpError)?.statusCode === 404
  ) {
    return undefined;
  }
  throw err;
};

export const upsertObject = async (
  kc: k8s.KubeConfig,
  obj: K8sObject,
  group: string,
  version: string,
  plural: string,
  beforeReplace?: (current: K8sObject) => K8sObject,
): Promise<{ response: { statusCode?: number } }> => {
  const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

  const currentObjVersion = await k8sApi.getNamespacedCustomObject(
    group,
    version,
    obj.metadata.namespace,
    plural,
    obj.metadata.name,
  ).catch((err) => {
    if ((err as k8s.HttpError).statusCode === 404) {
      return undefined;
    }
    throw err;
  });
  let response:
    | { response: { statusCode?: number } }
    | undefined = undefined;
  if (!currentObjVersion) {
    response = await k8sApi.createNamespacedCustomObject(
      group,
      version,
      obj.metadata.namespace,
      plural,
      obj,
    );
  } else {
    response = await k8sApi.replaceNamespacedCustomObject(
      group,
      version,
      obj.metadata.namespace,
      plural,
      obj.metadata.name,
      beforeReplace?.(currentObjVersion.body as K8sObject) ?? {
        ...obj,
        metadata: {
          ...(currentObjVersion.body as K8sObject).metadata,
          ...obj.metadata,
        },
      },
    );
  }
  return response;
};
