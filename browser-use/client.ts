// Types for the browser-use API client

// Task Status Enum
export enum TaskStatusEnum {
  CREATED = "created",
  RUNNING = "running",
  FINISHED = "finished",
  STOPPED = "stopped",
  PAUSED = "paused",
  FAILED = "failed",
}

// LLM Model types
export enum LLMModel {
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",
  GPT_4_1 = "gpt-4.1",
  GPT_4_1_MINI = "gpt-4.1-mini",
  GEMINI_2_0_FLASH = "gemini-2.0-flash",
  GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite",
  CLAUDE_3_7_SONNET = "claude-3-7-sonnet-20250219",
}

// Response types
export interface TaskCreatedResponse {
  id: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface TaskStepResponse {
  id: string;
  step: number;
  evaluation_previous_goal: string;
  next_goal: string;
}

export interface TaskBrowserDataResponse {
  cookies: Record<string, unknown>[];
}

export interface TaskResponse {
  id: string;
  task: string;
  live_url?: string | null;
  output?: string | null;
  status: TaskStatusEnum;
  created_at: string;
  finished_at?: string | null;
  steps: TaskStepResponse[];
  browser_data?: TaskBrowserDataResponse | null;
}

export interface TaskSimpleResponse {
  id: string;
  task: string;
  output?: string | null;
  status: TaskStatusEnum;
  created_at: string;
  finished_at?: string | null;
  live_url?: string | null;
}

export interface ListTasksResponse {
  tasks: TaskSimpleResponse[];
  total_pages: number;
  page: number;
  limit: number;
  total_count: number;
}

export interface TaskMediaResponse {
  recordings: string[] | null;
}

export interface TaskScreenshotsResponse {
  screenshots: string[] | null;
}

export interface TaskGifResponse {
  gif: string | null;
}

export interface CheckUserBalanceResponse {
  balance: number;
}

export interface RunTaskRequest {
  task: string;
  save_browser_data?: boolean | null;
  structured_output_json?: string | null;
  llm_model?: LLMModel | null;
  use_adblock?: boolean | null;
  use_proxy?: boolean | null;
}

// Client interface
export interface BrowserUseClient {
  "GET /health-check": {
    response: Record<string, never>;
  };

  "POST /api/v1/run-task": {
    response: TaskCreatedResponse;
    body: RunTaskRequest;
  };

  "PUT /api/v1/stop-task": {
    response: Record<string, never>;
    searchParams: {
      task_id: string;
    };
  };

  "PUT /api/v1/pause-task": {
    response: Record<string, never>;
    searchParams: {
      task_id: string;
    };
  };

  "PUT /api/v1/resume-task": {
    response: Record<string, never>;
    searchParams: {
      task_id: string;
    };
  };

  "GET /api/v1/task/:task_id": {
    response: TaskResponse;
  };

  "GET /api/v1/task/:task_id/status": {
    response: TaskStatusEnum;
  };

  "GET /api/v1/task/:task_id/media": {
    response: TaskMediaResponse;
  };

  "GET /api/v1/task/:task_id/screenshots": {
    response: TaskScreenshotsResponse;
  };

  "GET /api/v1/task/:task_id/gif": {
    response: TaskGifResponse;
  };

  "GET /api/v1/tasks": {
    response: ListTasksResponse;
    searchParams: {
      page?: number;
      limit?: number;
    };
  };

  "GET /api/v1/balance": {
    response: CheckUserBalanceResponse;
  };

  "GET /api/v1/me": {
    response: boolean;
  };

  "GET /api/v1/ping": {
    response: Record<string, never>;
  };
}
