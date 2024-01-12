import {
  CRYPTO_KEY_ENV_VAR,
  generateAESKey,
  getSavedAES,
} from "../../../../website/utils/crypto.ts";
import { ignoreIfExists } from "../../common/objects.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { DECO_SITES_PVC } from "../build.ts";

export interface Props {
  site: string;
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
/**
 * Provision namespace of the new site and required resources.
 * @title Create Site
 */
export default async function newSite(
  { site }: Props,
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

  await corev1Api.createNamespace({
    metadata: { name: Namespace.forSite(site) },
  }).catch(ignoreIfExists);
  const [secretEnvVar] = await Promise.all([
    secretEnvVarPromise,
    corev1Api.createNamespacedPersistentVolumeClaim(site, {
      metadata: { name: DECO_SITES_PVC, namespace: Namespace.forSite(site) },
      spec: {
        accessModes: ["ReadWriteMany"],
        storageClassName: EFS_SC,
        resources: { requests: { storage: "5Gi" } }, // since this should be EFS the size doesn't matter.
      },
    }).catch(ignoreIfExists),
  ]);
  const state = {
    envVars: [secretEnvVar],
  };
  await ctx.invoke.kubernetes.actions.siteState.upsert({
    site,
    state,
    create: true,
  });
  return state;
}
