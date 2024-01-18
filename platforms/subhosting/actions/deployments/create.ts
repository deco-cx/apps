import { badRequest } from "deco/mod.ts";
import {
  type DirectoryEntry,
  type FileSystemNode,
  isDir,
  walk,
} from "../../../../files/sdk.ts";
import { assertHasDeploymentParams, SubhostingConfig } from "../../commons.ts";
import { Subhosting } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { calculateGitSha1 } from "../../sha1.ts";

export interface CompilerOptions {
  jsx: string;
  jsxImportSource: string;
}
export interface Props extends SubhostingConfig {
  files: FileSystemNode;
  compilerOptions: CompilerOptions | null;
  entrypointUrl: string;
  importMapUrl: string | null;
  envVars?: Record<string, string>;
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
      calculateGitSha1(textEncoder.encode(content)).then((gitSha1) => {
        assets[path] = {
          content,
          gitSha1,
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
  domain: string;
  status: string;
}

export default async function deploy(
  { compilerOptions, entrypointUrl, importMapUrl, envVars, ...props }: Props,
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
  const deployment = await client.createDeployment(projectId!, {
    assets,
    compilerOptions,
    entrypointUrl,
    importMapUrl,
    envVars,
  }).then((d) => d.json());
  console.log({ deployment });

  return {
    domain: deployment.domains[0],
    status: deployment.status,
  };
}
