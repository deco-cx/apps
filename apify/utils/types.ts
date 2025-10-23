// Apify API types based on official v2 documentation
export interface ActorRun {
  id: string;
  // deno-lint-ignore no-explicit-any
  data?: any;
  actId: string;
  userId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  buildId?: string;
  exitCode?: number;
  defaultDatasetId?: string;
  defaultKeyValueStoreId?: string;
  defaultRequestQueueId?: string;
  buildNumber?: string;
  isContainerServerReady?: boolean;
  gitBranchName?: string;
  usage?: {
    ACTOR_COMPUTE_UNITS?: number;
    DATASET_READS?: number;
    DATASET_WRITES?: number;
    KEY_VALUE_STORE_READS?: number;
    KEY_VALUE_STORE_WRITES?: number;
    REQUEST_QUEUE_READS?: number;
    REQUEST_QUEUE_WRITES?: number;
    DATA_TRANSFER_INTERNAL_GBYTES?: number;
    DATA_TRANSFER_EXTERNAL_GBYTES?: number;
    PROXY_RESIDENTIAL_TRANSFER_GBYTES?: number;
    PROXY_SERPS?: number;
  };
  usageTotalUsd?: number;
  usageUsd?: {
    ACTOR_COMPUTE_UNITS?: number;
    DATASET_READS?: number;
    DATASET_WRITES?: number;
    KEY_VALUE_STORE_READS?: number;
    KEY_VALUE_STORE_WRITES?: number;
    REQUEST_QUEUE_READS?: number;
    REQUEST_QUEUE_WRITES?: number;
    DATA_TRANSFER_INTERNAL_GBYTES?: number;
    DATA_TRANSFER_EXTERNAL_GBYTES?: number;
    PROXY_RESIDENTIAL_TRANSFER_GBYTES?: number;
    PROXY_SERPS?: number;
  };
}

// Enhanced ActorRun response that may include dataset results
export interface ActorRunResponse {
  data: ActorRun & {
    // Dataset items included when includeDatasetItems is true
    results?: Array<Record<string, unknown>>;
  };
}

export interface Actor {
  id: string;
  userId: string;
  name: string;
  username: string;
  description?: string;
  readme?: string;
  isPublic: boolean;
  createdAt: string;
  modifiedAt: string;
  restartOnError: boolean;
  isDeprecated: boolean;
  isAnonymouslyRunnable: boolean;
  categories: string[];
  defaultRunOptions?: {
    build: string;
    timeoutSecs: number;
    memoryMbytes: number;
  };
  exampleRunInput?: Record<string, unknown>;
  stats: {
    totalRuns: number;
    totalUsers?: number;
    totalUsers7Days?: number;
    totalUsers30Days?: number;
    totalUsers90Days?: number;
    totalMetamorphs?: number;
    lastRunStartedAt?: string;
  };
}

export interface ActorsResponse {
  data: {
    total: number;
    count: number;
    offset: number;
    limit: number;
    desc: boolean;
    items: Actor[];
  };
}

export interface ActorRunsResponse {
  data: {
    total: number;
    count: number;
    offset: number;
    limit: number;
    desc: boolean;
    items: ActorRun[];
  };
}

export interface Dataset {
  id: string;
  name?: string;
  userId: string;
  createdAt: string;
  modifiedAt: string;
  accessedAt: string;
  itemCount: number;
  cleanItemCount: number;
  actId?: string;
  actRunId?: string;
}

export interface KeyValueStore {
  id: string;
  name?: string;
  userId: string;
  createdAt: string;
  modifiedAt: string;
  accessedAt: string;
  actId?: string;
  actRunId?: string;
}

// Dataset Items API types
export type DatasetItemFormat =
  | "json"
  | "jsonl"
  | "xml"
  | "html"
  | "csv"
  | "xlsx"
  | "rss";

export interface DatasetItemsQueryParams {
  /** Response format - determines how data is structured and returned */
  format?: DatasetItemFormat;
  /** Skip hidden fields (starting with #) from output */
  skipHidden?: boolean | 0 | 1;
  /** Clean output by omitting hidden fields (alias for skipHidden) */
  clean?: boolean | 0 | 1;
  /** Unwind array fields to separate items */
  unwind?: string;
  /** Flatten nested objects using dot notation */
  flatten?: string[];
  /** Select only specific fields */
  fields?: string[];
  /** Omit specific fields */
  omit?: string[];
  /** Return results in descending order (newest first) */
  desc?: boolean | 0 | 1;
  /** Pagination offset */
  offset?: number;
  /** Maximum number of items to return */
  limit?: number;
  /** Custom XML root element name (for XML/RSS formats) */
  xmlRoot?: string;
  /** Custom XML row element name (for XML/RSS formats) */
  xmlRow?: string;
  /** Skip empty items */
  skipEmpty?: boolean | 0 | 1;
  /** Simplified format for easier processing */
  simplified?: boolean | 0 | 1;
}
