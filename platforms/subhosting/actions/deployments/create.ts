import { badRequest } from "deco/mod.ts";
import { CompilerOptions } from "../../../../admin/platform.ts";
import {
  type DirectoryEntry,
  type FileSystemNode,
  isDir,
  walk,
} from "../../../../files/sdk.ts";
import { assertHasDeploymentParams, SubhostingConfig } from "../../commons.ts";
import { AppContext } from "../../mod.ts";
import { calculateGitSha1 } from "../../sha1.ts";
import { ManifestEntry, Subhosting } from "../../subhosting.ts";

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
}

export interface Hash extends AssetBase {
  kind: "file";
  gitSha1?: string;
}

interface Symlink extends AssetBase {
  kind: "symlink";
  target: string;
}

type Asset = Hash | File | Symlink;

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
    const encoded = textEncoder.encode(content);
    assetsBuild.push(
      calculateGitSha1(encoded).then((gitSha1) => {
        assets[path.slice(1)] = path === "/main.ts"
          ? { gitSha1, kind: "file" }
          : { content, encoding: "utf-8", kind: "file" };
      }),
    );
  }
  await Promise.all(assetsBuild);
  return assets;
};

const _buildEntries = async (
  node: FileSystemNode,
): Promise<Record<string, ManifestEntry>> => {
  const entries: Record<string, ManifestEntry> = {};

  const entriesBuild: Promise<void>[] = [];

  for (const { path, content } of walk(node)) {
    const segments = path.split("/");
    const fileName = segments.pop()!;
    let currEntries = entries;
    for (const dir of segments) {
      const currDir = {
        kind: "directory" as const,
        entries: {},
      };
      currEntries[dir] = currDir;
      currEntries = currDir.entries;
    }
    const data = textEncoder.encode(content);
    const gitSha1Promise = calculateGitSha1(data);
    entriesBuild.push(gitSha1Promise.then((gitSha1) => {
      currEntries[fileName] = {
        kind: "file" as const,
        gitSha1,
        size: data.byteLength,
      };
    }));
  }
  await Promise.all(entriesBuild);
  return entries;
};

export interface Deployment {
  id: string;
  domain?: string;
  status: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function deploy(
  {
    compilerOptions,
    entryPointUrl,
    importMapUrl,
    envVars,
    databases,
    ...props
  }: Props,
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
