import { FileSystemNode } from "../files/sdk.ts";

export interface DomainOpts {
  site: string;
  domain: string;
}
export interface RepoOpts {
  site: string;
  owner: string;
  repo: string;
}

export interface PromoteOpts {
  site: string;
  deploymentId: string;
}

export interface DeploymentOpts {
  site: string;
  owner: string;
  repo: string;
  commitSha: string;
  production?: boolean;
}

export interface Domain {
  url: string;
  production: boolean;
}

export interface Deployment {
  id: string;
  domains: Domain[];
}

export interface UpdateDeploymentOpts {
  site: string;
  release: string;
}

export interface CreateSiteOptsBase {
  site: string;
  release?: string;
  mode: string;
}

export interface CreateSiteFromRepoOpts extends CreateSiteOptsBase {
  mode: "repo";
  repo: Omit<RepoOpts, "site">;
}

export interface CreateSiteFromFilesOpts extends CreateSiteOptsBase {
  mode: "files";
  files: FileSystemNode;
  decofile?: Record<string, unknown>;
}

export type CreateSiteOpts = CreateSiteFromRepoOpts | CreateSiteFromFilesOpts;
export function assertCreateIsFromRepo(
  opts: CreateSiteOpts,
): asserts opts is CreateSiteFromRepoOpts {
  if (opts?.mode !== "repo") {
    throw new Error(`create from ${opts?.mode} not supported`);
  }
}

export function assertCreateIsFromFile(
  opts: CreateSiteOpts,
): asserts opts is CreateSiteFromFilesOpts {
  if (opts?.mode !== "files") {
    throw new Error(`create from ${opts?.mode} not supported`);
  }
}
export interface DeleteSiteOpts {
  site: string;
}

export interface Domains {
  create: (opts: DomainOpts) => Promise<void>;
  delete: (opts: DomainOpts) => Promise<void>;
}

export interface Deployments {
  promote: (opts: PromoteOpts) => Promise<void>;
  create: (opts: DeploymentOpts) => Promise<Deployment>;
  update: (opts: UpdateDeploymentOpts) => Promise<Deployment>;
}

export interface Sites {
  create: (opts: CreateSiteOpts) => Promise<void>;
  delete: (opts: DeleteSiteOpts) => Promise<void>;
}

export interface Platform {
  name: string;
  cfZoneId: string;
  domain: string;
  deployments: Deployments;
  sites: Sites;
  domains: Domains;
}
