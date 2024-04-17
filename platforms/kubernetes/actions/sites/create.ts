import { SiteLifecycle } from "../../../../admin/platform.ts";
import {
  CRYPTO_KEY_ENV_VAR,
  generateAESKey,
  getSavedAES,
} from "../../../../website/utils/crypto.ts";
import { ignoreIfExists } from "../../common/objects.ts";
import { k8s } from "../../deps.ts";
import {
  NODE_LABELS_KEY,
  NODE_LABELS_VALUES,
  NodeSelector,
} from "../../loaders/siteState/get.ts";
import { AppContext, PREVIEW_SERVICE_SCALING } from "../../mod.ts";
import { DECO_SITES_PVC } from "../build.ts";

export interface Props {
  site: string;
  lifecycle?: SiteLifecycle;
}

export const Namespace = {
  forSite: (site: string) => `sites-${site}`,
};

const DECO_DENO_TOKEN = Deno.env.get("DECO_DENO_TOKEN");

interface KvDb {
  branch: "*" | "main";
  databaseId: string;
}
interface DatabasesResponse {
  dbList: KvDb[];
}
const getDatabaseId = async (site: string) => {
  const databases: DatabasesResponse = await fetch(
    `https://dash.deno.com/projects/deco-sites-${site}/kv?_data_`,
    {
      "headers": {
        cookie: `token=${DECO_DENO_TOKEN}`,
        "Content-Type": "application/json",
      },
      "body": null,
      "method": "GET",
    },
  ).then((resp) => resp.json()).catch((err) => {
    console.log("ignoring read database error", err);
    return {
      dbList: [],
    };
  });

  return databases.dbList.find((db) => db.branch === "main")?.databaseId;
};
const EFS_SC = "efs-sc";
const getOrGenerateAESKey = async (site: string) => {
  const databaseId = await getDatabaseId(site);
  if (!databaseId) {
    return generateAESKey();
  }
  let kv: Deno.Kv | null = null;
  try {
    // copy from deno deploy if it exists
    kv = await Deno.openKv(
      `https://api.deno.com/databases/${databaseId}/connect`,
    );
    return getSavedAES(kv).then((v) => v ?? generateAESKey());
  } catch {
    return generateAESKey();
  } finally {
    kv?.close();
  }
};

export const defineNodeSelectorRules = (_site: string): NodeSelector => {
  // TODO: Replace this for actual rules, now we just need to isolate new sites from prod sites because of the PH
  const nodeLabelDecoEvent = NODE_LABELS_KEY.DECO_EVENT;
  const nodeValueProductHunt =
    NODE_LABELS_VALUES[nodeLabelDecoEvent].PRODUCT_HUNT;

  return {
    [nodeLabelDecoEvent]: nodeValueProductHunt,
  };
};

/**
 * Provision namespace of the new site and required resources.
 * @title Create Site
 */
export default async function newSite(
  { site, lifecycle }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const corev1Api = ctx.kc.makeApiClient(k8s.CoreV1Api);
  const secretEnvVarPromise = getOrGenerateAESKey(site).then((aeskey) => {
    return {
      name: CRYPTO_KEY_ENV_VAR,
      value: btoa(JSON.stringify(aeskey)),
    };
  });

  const siteNs = Namespace.forSite(site);

  await corev1Api.createNamespace({
    metadata: {
      name: siteNs,
      ...lifecycle ? { labels: { ["site-lifecycle"]: lifecycle } } : {},
    },
  }).catch(ignoreIfExists);
  const setupPromises: Promise<unknown>[] = [];
  const isEphemeral = lifecycle === "ephemeral";
  if (isEphemeral) {
    // TODO put this back when resource quota is well designed.
    // setupPromises.push(
    //   corev1Api.createNamespacedResourceQuota(siteNs, {
    //     apiVersion: "v1",
    //     kind: "ResourceQuota",
    //     metadata: {
    //       name: `${siteNs}-quota`,
    //     },
    //     spec: {
    //       hard: {
    //         "requests.cpu": "2000m",
    //         "requests.memory": "512Mi",
    //         "limits.cpu": "4000m",
    //         "limits.memory": "2Gi",
    //       },
    //     },
    //   }).catch(ignoreIfExists),
    // );
  }
  const [secretEnvVar] = await Promise.all([
    secretEnvVarPromise,
    ...setupPromises,
    corev1Api.createNamespacedPersistentVolumeClaim(siteNs, {
      metadata: { name: DECO_SITES_PVC, namespace: siteNs },
      spec: {
        accessModes: ["ReadWriteMany"],
        storageClassName: EFS_SC,
        resources: { requests: { storage: "5Gi" } }, // since this should be EFS the size doesn't matter.
      },
    }).catch(ignoreIfExists),
  ]);

  const nodeSelector = defineNodeSelectorRules(site);

  const state = {
    nodeSelector,
    ...isEphemeral ? { scaling: PREVIEW_SERVICE_SCALING } : {},
    envVars: [secretEnvVar],
  };
  await ctx.invoke.kubernetes.actions.siteState.upsert({
    site,
    state,
    create: true,
  });
  return state;
}
