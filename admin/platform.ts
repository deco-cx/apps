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

export interface ReleaseOpts {
  site: string;
  release: string;
}

export interface CreateSiteOpts {
  site: string;
  repo: Omit<RepoOpts, "site">;
  release?: Omit<ReleaseOpts, "site">;
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
  withRelease: (opts: ReleaseOpts) => Promise<Deployment>;
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
