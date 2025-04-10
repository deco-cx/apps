// Types for Deno Deploy API Client

// Organization Types
export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name?: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

// Deployment Types
export type DeploymentId = string;

export interface DeploymentPermissions {
  net?: string[];
}

export interface DeploymentPermissionsOverwrite {
  net?: string[];
}

export type DeploymentStatus = "failed" | "pending" | "success";

export interface Deployment {
  id: DeploymentId;
  projectId: string;
  description?: string;
  status: DeploymentStatus;
  domains?: string[];
  databases: Record<string, string>;
  requestTimeout?: number;
  permissions?: DeploymentPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeploymentRequest {
  entryPointUrl: string;
  importMapUrl?: string | null;
  lockFileUrl?: string | null;
  compilerOptions?: CompilerOptions | null;
  assets: Assets;
  domains?: string[] | null;
  envVars: Record<string, string>;
  databases?: Record<string, string> | null;
  requestTimeout?: number | null;
  permissions?: DeploymentPermissions | null;
  description?: string | null;
}

export interface RedeployRequest {
  envVars?: Record<string, string | null> | null;
  databases?: Record<string, string | null> | null;
  requestTimeout?: number | null;
  permissions?: DeploymentPermissionsOverwrite | null;
  description?: string | null;
}

// Assets Types for Deployments
export type Encoding = "utf-8" | "base64";

export interface File {
  content?: string;
  encoding?: Encoding;
  gitSha1?: string;
}

export interface Symlink {
  target: string;
}

export type Asset =
  | ({ kind: "file" } & File)
  | ({ kind: "symlink" } & Symlink);

export type Assets = Record<string, Asset>;

// Domain Types
export interface Domain {
  id: string;
  organizationId: string;
  domain: string;
  token: string;
  isValidated: boolean;
  certificates: DomainCertificate[];
  provisioningStatus: ProvisioningStatus;
  projectId?: string;
  deploymentId?: DeploymentId;
  createdAt: string;
  updatedAt: string;
  dnsRecords: DnsRecord[];
}

export interface DnsRecord {
  type: string;
  name: string;
  content: string;
}

export interface DomainCertificate {
  cipher: TlsCipher;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type TlsCipher = "rsa" | "ec";

export type ProvisioningStatus =
  | { code: "success" }
  | { code: "failed"; message: string }
  | { code: "pending" }
  | { code: "manual" };

export interface CreateDomainRequest {
  domain: string;
}

export interface UpdateDomainAssociationRequest {
  deploymentId?: DeploymentId;
}

export interface AddDomainCertificateRequest {
  privateKey: string;
  certificateChain: string;
}

export interface AttachDomainResponse {
  domain: string;
}

// KV Database Types
export interface KvDatabase {
  id: string;
  organizationId: string;
  description: string;
  updatedAt: string;
  createdAt: string;
}

export interface CreateKvDatabaseRequest {
  description?: string | null;
}

export interface UpdateKvDatabaseRequest {
  description?: string | null;
}

// KV Backup Types
export interface KvDatabaseBackupTarget {
  endpoint: string;
  bucketName: string;
  bucketRegion: string;
  accessKeyId: string;
  prefix: string;
  kind: "s3";
}

export type KvDatabaseBackupStatus =
  | { code: "pending" }
  | { code: "active" }
  | { code: "failed"; message: string };

export interface KvDatabaseBackup extends KvDatabaseBackupTarget {
  id: string;
  status: KvDatabaseBackupStatus;
}

export interface EnableKvDatabaseBackupRequest extends KvDatabaseBackupTarget {
  secretAccessKey: string;
}

export interface EnableKvDatabaseBackupResponse {
  id: string;
}

// deno-lint-ignore no-empty-interface
export interface DisableKvDatabaseBackupResponse {}

// Analytics Types
export type AnalyticsFieldType =
  | "time"
  | "number"
  | "string"
  | "boolean"
  | "other";

export interface AnalyticsFieldSchema {
  name: string;
  type: AnalyticsFieldType;
}

export type AnalyticsDataValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null;

export interface Analytics {
  fields: AnalyticsFieldSchema[];
  values: AnalyticsDataValue[][];
}

// Logs Types
export type LogLevel = "error" | "warning" | "info" | "debug";
export type Region =
  | "gcp-us-central1"
  | "gcp-us-east1"
  | "gcp-us-west1"
  | string;

export interface BuildLogsResponseEntry {
  level: string;
  message: string;
}

export interface AppLogsResponseEntry {
  time: string;
  level: LogLevel;
  message: string;
  region: Region;
}

// Error Types
export interface ErrorBody {
  code: string;
  message: string;
}

// Compiler Options
export interface CompilerOptions {
  experimentalDecorators?: boolean | null;
  emitDecoratorMetadata?: boolean | null;
  jsx?: string | null;
  jsxFactory?: string | null;
  jsxFragmentFactory?: string | null;
  jsxImportSource?: string | null;
  jsxPrecompileSkipElements?: string[] | null;
}

// API Client Interface
export interface DenoDeployClient {
  // Organization Endpoints
  "GET /organizations/:organizationId": {
    response: Organization;
  };
  "GET /organizations/:organizationId/analytics": {
    response: Analytics;
    searchParams: {
      since: string;
      until: string;
    };
  };

  // Project Endpoints
  "GET /organizations/:organizationId/projects": {
    response: Project[];
    searchParams?: {
      page?: number;
      limit?: number;
      q?: string;
      sort?: string;
      order?: string;
    };
  };
  "POST /organizations/:organizationId/projects": {
    response: Project;
    body: CreateProjectRequest;
  };
  "GET /projects/:projectId": {
    response: Project;
  };
  "PATCH /projects/:projectId": {
    response: Project;
    body: UpdateProjectRequest;
  };
  "DELETE /projects/:projectId": {
    response: void;
  };
  "GET /projects/:projectId/analytics": {
    response: Analytics;
    searchParams: {
      since: string;
      until: string;
    };
  };

  // Deployment Endpoints
  "GET /projects/:projectId/deployments": {
    response: Deployment[];
    searchParams?: {
      page?: number;
      limit?: number;
      q?: string;
      sort?: string;
      order?: string;
    };
  };
  "POST /projects/:projectId/deployments": {
    response: Deployment;
    body: CreateDeploymentRequest;
  };
  "GET /deployments/:deploymentId": {
    response: Deployment;
  };
  "DELETE /deployments/:deploymentId": {
    response: void;
  };
  "POST /deployments/:deploymentId/redeploy": {
    response: Deployment;
    body: RedeployRequest;
  };
  "GET /deployments/:deploymentId/build_logs": {
    response: BuildLogsResponseEntry[];
  };
  "GET /deployments/:deploymentId/app_logs": {
    response: AppLogsResponseEntry[];
    searchParams?: {
      q?: string;
      level?: string;
      region?: string;
      since?: string;
      until?: string;
      limit?: number;
      sort?: string;
      order?: string;
      cursor?: string;
    };
  };
  "PUT /deployments/:deploymentId/domains/:domain": {
    response: AttachDomainResponse;
  };
  "DELETE /deployments/:deploymentId/domains/:domain": {
    response: void;
  };

  // KV Database Endpoints
  "GET /organizations/:organizationId/databases": {
    response: KvDatabase[];
    searchParams?: {
      page?: number;
      limit?: number;
      q?: string;
      sort?: string;
      order?: string;
    };
  };
  "POST /organizations/:organizationId/databases": {
    response: KvDatabase;
    body: CreateKvDatabaseRequest;
  };
  "PATCH /databases/:databaseId": {
    response: KvDatabase;
    body: UpdateKvDatabaseRequest;
  };
  "POST /databases/:databaseId/database_backups": {
    response: EnableKvDatabaseBackupResponse;
    body: EnableKvDatabaseBackupRequest;
  };
  "GET /databases/:databaseId/database_backups": {
    response: KvDatabaseBackup[];
  };
  "GET /database_backups/:databaseBackupId": {
    response: KvDatabaseBackup;
  };
  "DELETE /database_backups/:databaseBackupId": {
    response: DisableKvDatabaseBackupResponse;
  };

  // Domain Endpoints
  "GET /organizations/:organizationId/domains": {
    response: Domain[];
    searchParams?: {
      page?: number;
      limit?: number;
      q?: string;
      sort?: string;
      order?: string;
    };
  };
  "POST /organizations/:organizationId/domains": {
    response: Domain;
    body: CreateDomainRequest;
  };
  "GET /domains/:domainId": {
    response: Domain;
  };
  "PATCH /domains/:domainId": {
    response: void;
    body: UpdateDomainAssociationRequest;
  };
  "DELETE /domains/:domainId": {
    response: void;
  };
  "POST /domains/:domainId/verify": {
    response: void;
  };
  "POST /domains/:domainId/certificates": {
    response: void;
    body: AddDomainCertificateRequest;
  };
  "POST /domains/:domainId/certificates/provision": {
    response: void;
  };
}
