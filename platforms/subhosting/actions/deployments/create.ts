import { badRequest } from "deco/mod.ts";
import { CompilerOptions } from "../../../../admin/platform.ts";
import {
  isDir,
  walk,
  type DirectoryEntry,
  type FileSystemNode,
} from "../../../../files/sdk.ts";
import { SubhostingConfig, assertHasDeploymentParams } from "../../commons.ts";
import { Subhosting } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { calculateGitSha1 } from "../../sha1.ts";

export interface Props extends SubhostingConfig {
  files: FileSystemNode;
  compilerOptions: CompilerOptions | null;
  entryPointUrl: string;
  importMapUrl: string | null;
  envVars?: Record<string, string>;
  databases?: Record<string, string>;
}

interface AssetBase {
  kind: string;
}
export interface File extends AssetBase {
  kind: "file";
  content: string;
  encoding?: "utf-8" | "base64";
  gitSha1?: string;
}

interface Symlink extends AssetBase {
  kind: "symlink";
  target: string;
}

type Asset = File | Symlink;

type Assets = Record<string, Asset>;

export function assetIsRootLevelDir(
  node: FileSystemNode,
): asserts node is DirectoryEntry {
  !isDir(node) &&
    badRequest({ message: "Root level asset must be a directory" });
}
const textEncoder = new TextEncoder();
const buildAssets = async (node: FileSystemNode): Promise<Assets> => {
  const assets: Assets = {};

  const assetsBuild: Promise<void>[] = [];

  for (const { path, content } of walk(node)) {
    assetsBuild.push(
      calculateGitSha1(textEncoder.encode(content)).then((_gitSha1) => {
        assets[path.slice(1)] = {
          content,
          // gitSha1,
          encoding: "utf-8",
          kind: "file",
        };
      }),
    );
  }
  await Promise.all(assetsBuild);
  return assets;
};

export interface Deployment {
  id: string;
  domain?: string;
  status: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function deploy(
  { compilerOptions, entryPointUrl, importMapUrl, envVars, databases, ...props }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> {
  const deployAccessToken = props.deployAccessToken ??
    ctx.deployAccessToken;
  const deployOrgId = props.deployOrgId ?? ctx.deployOrgId;
  const projectId = props.projectId ?? ctx.projectId;
  assertHasDeploymentParams({ deployAccessToken, deployOrgId, projectId });
  const client = new Subhosting(deployAccessToken, deployOrgId);
  const assets = await buildAssets(props.files);
  const created = await client.createDeployment(projectId!, {
    databases,
    assets,
    compilerOptions,
    entryPointUrl,
    importMapUrl,
    envVars,
  }).then((d) => d.json());

  let deployment = created;
  while (true) {
    const deployments = await client.listDeployments(projectId!).then((res) =>
      res.json()
    );

    deployment = deployments.find((d: { id: string }) => d.id === created.id);

    if (deployment.status !== "pending") {
      break;
    }

    await sleep(2.5e3);
  }

  const domain = deployment.domains?.[0];

  return {
    id: deployment.id,
    domain: domain ? `https://${domain}` : undefined,
    status: deployment.status,
  };
}
