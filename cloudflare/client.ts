// Define data types for Cloudflare API
export interface WorkerScript {
  id: string;
  name: string;
  created_on?: string;
  modified_on?: string;
  etag?: string;
  has_assets?: boolean;
  has_modules?: boolean;
  logpush?: boolean;
  script?: string;
  workers_placement_info?: {
    last_analyzed_at?: string;
    mode?: "smart";
    status?: "SUCCESS" | "UNSUPPORTED_APPLICATION" | "INSUFFICIENT_INVOCATIONS";
  };
  workers_tail_consumers?: Array<{
    environment?: string;
    namespace?: string;
    service: string;
  }>;
  usage_model?: "standard";
}

export interface WorkersMessage {
  code: number;
  documentation_url?: string;
  message?: string;
  object?: unknown;
  pointer?: string;
}

export interface ListWorkersResponse {
  result: WorkerScript[];
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface ScriptContentResponse {
  result: WorkerScript;
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface Account {
  created_on: string;
  id: string;
  name: string;
  object?: {
    abuse_contact_email?: string;
    default_nameservers?:
      | "cloudflare.standard"
      | "custom.account"
      | "custom.tenant";
    enforce_twofactor?: boolean;
    use_account_custom_ns_by_default?: boolean;
  };
}

export interface ListAccountsResponse {
  success: boolean;
  result?: Account[];
  errors: any[];
  messages: any[];
  iam_result_info?: {
    count: number;
    page: number;
    per_page: number;
    total_count: number;
  };
}

// Worker binding types
export interface DurableObjectBinding {
  type: "durable_object_namespace";
  name: string;
  class_name: string;
  script_name?: string;
}

export type WorkerBinding =
  | {
    type: "kv_namespace";
    name: string;
    namespace_id: string;
  }
  | {
    type: "r2_bucket";
    name: string;
    bucket_name: string;
  }
  | {
    type: "d1_database";
    name: string;
    database_id: string;
  }
  | {
    type: "service";
    name: string;
    service: string;
  }
  | {
    type: "analytics_engine";
    name: string;
    dataset: string;
  }
  | {
    type: "queue";
    name: string;
    queue_name: string;
  }
  | DurableObjectBinding;

export interface DurableObjectMigrations {
  tag: string;
  new_classes?: string[];
  new_sqlite_classes?: string[];
  renamed_classes?: {
    from: string;
    to: string;
  }[];
  deleted_classes?: string[];
}

export interface Observability {
  enabled: boolean;
  head_sampling_rate?: number;
}

export interface WorkerMetadata {
  main_module?: string;
  compatibility_date?: string;
  compatibility_flags?: string[];
  bindings?: WorkerBinding[];
  migrations?: DurableObjectMigrations;
  observability?: Observability;
  [key: string]: unknown;
}

export interface WorkerDomain {
  environment: string;
  hostname: string;
  id: string;
  service: string;
  zone_id: string;
  zone_name: string;
}

export interface ListWorkerDomainsResponse {
  result: WorkerDomain[];
  success: boolean;
  errors: WorkersMessage[];
  messages: WorkersMessage[];
}

export interface WorkerSubdomain {
  subdomain: string;
}

export interface WorkerSubdomainResponse {
  result: WorkerSubdomain;
  success: boolean;
  errors: WorkersMessage[];
  messages: WorkersMessage[];
}

// Define client interface
export interface CloudflareClient {
  // List Workers
  "GET /accounts/:account_id/workers/scripts": {
    response: ListWorkersResponse;
  };

  // Get script content
  "GET /accounts/:account_id/workers/scripts/:script_name": {
    response: string;
  };

  // Put script content with metadata and bindings
  "PUT /accounts/:account_id/workers/scripts/:script_name": {
    response: ScriptContentResponse;
    body: FormData;
  };

  // Delete a worker script
  "DELETE /accounts/:account_id/workers/scripts/:script_name": {
    response: {
      success: boolean;
      errors: any[];
      messages: any[];
    };
  };

  // Enable/disable a worker on workers.dev subdomain
  "POST /accounts/:account_id/workers/scripts/:script_name/subdomain": {
    response: {
      success: boolean;
      errors: any[];
      messages: any[];
    };
    body: {
      enabled: boolean;
    };
  };

  // List Accounts
  "GET /accounts": {
    response: ListAccountsResponse;
    searchParams?: {
      name?: string;
      page?: number;
      per_page?: number;
      direction?: "asc" | "desc";
    };
  };

  // List Worker Domains
  "GET /accounts/:account_id/workers/domains": {
    response: ListWorkerDomainsResponse;
    searchParams?: {
      zone_name?: string;
      service?: string;
      zone_id?: string;
      hostname?: string;
      environment?: string;
    };
  };

  // Get Workers Subdomain
  "GET /accounts/:account_id/workers/subdomain": {
    response: WorkerSubdomainResponse;
  };
}
