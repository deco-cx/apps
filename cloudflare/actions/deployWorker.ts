import { AppContext } from "../mod.ts";
import {
  DurableObjectMigrations,
  ScriptContentResponse,
  WorkerBinding,
} from "../client.ts";

export interface Props {
  /**
   * @title Account ID
   * @description Use a specific account ID (overrides app settings)
   */
  accountId?: string;

  /**
   * @title Script Name
   * @description The name of the Worker script to deploy
   */
  scriptName: string;

  /**
   * @title Script Content
   * @description JavaScript code for the Worker. export default {\n  async fetch(request, env, ctx) {\n    return new Response(..
   */
  scriptContent: string;

  /**
   * @title Module Type
   * @description The type of module to use for the script
   */
  moduleType?: "esm" | "service-worker";

  /**
   * @title Resource Bindings
   * @description Array of resource bindings (KV, R2, D1, etc.)
   */
  bindings?: WorkerBinding[];

  /**
   * @title Compatibility Date
   * @description Compatibility date for the Worker (e.g., "2024-01-01")
   */
  compatibilityDate?: string;

  /**
   * @title Compatibility Flags
   * @description Array of compatibility flags
   */
  compatibilityFlags?: string[];

  /**
   * @title Migrations
   * @description Durable Object migrations for adding/removing/renaming classes
   */
  migrations?: DurableObjectMigrations;

  /**
   * @title Skip Workers.dev
   * @description Do not deploy the Worker on your workers.dev subdomain
   */
  skipWorkersDev?: boolean;

  /**
   * @title No Observability
   * @description Disable Worker Logs for this worker
   */
  noObservability?: boolean;
}

/**
 * @title Deploy Worker
 * @description Deploy or update a Cloudflare Worker with full configuration
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  success: boolean;
  action: string;
  name: string;
  domain?: string;
}> => {
  // Use the provided account ID or fall back to the one in app context
  const accountId = props.accountId || ctx.accountId;
  const {
    scriptName,
    scriptContent,
    moduleType = "esm",
    bindings = [],
    compatibilityDate = "2024-01-01",
    compatibilityFlags = [],
    migrations,
    skipWorkersDev = false,
    noObservability = false,
  } = props;

  // Check if worker already exists
  let workerExists = false;
  try {
    const listResponse = await ctx.api
      ["GET /accounts/:account_id/workers/scripts"]({
        account_id: accountId,
      });

    const listResult = await listResponse.json();
    if (listResult.success && Array.isArray(listResult.result)) {
      workerExists = listResult.result.some((worker) =>
        worker.name === scriptName
      );
    }
  } catch (error) {
    console.warn(`Error checking if worker exists: ${error}`);
    // Continue with deployment even if check fails
  }

  // Create form data with script content
  const formData = new FormData();

  // Create metadata
  const metadata: {
    main_module?: string;
    body_part?: string;
    bindings: WorkerBinding[];
    compatibility_date?: string;
    compatibility_flags?: string[];
    migrations?: DurableObjectMigrations;
    observability?: { enabled: boolean };
  } = {
    bindings: bindings,
    compatibility_date: compatibilityDate,
    compatibility_flags: compatibilityFlags,
  };

  // Set up module formatting
  if (moduleType === "esm") {
    metadata.main_module = "worker.js";
  } else {
    metadata.body_part = "worker.js";
  }

  // Add migrations if specified
  if (migrations) {
    metadata.migrations = migrations;
  }

  // Configure observability
  metadata.observability = { enabled: !noObservability };

  // Add metadata to form
  formData.append("metadata", JSON.stringify(metadata));

  // Add worker script as a part
  const blob = new Blob([scriptContent], {
    type: moduleType === "esm"
      ? "application/javascript+module"
      : "application/javascript",
  });

  formData.append("worker.js", blob, "worker.js");

  // Deploy the worker
  try {
    const response = await ctx.api
      ["PUT /accounts/:account_id/workers/scripts/:script_name"](
        {
          account_id: accountId,
          script_name: scriptName,
        },
        {
          body: formData,
        },
      );

    const result = await response.json();
    console.log({ result });

    if (!result.success) {
      const errorMsg = result.errors.length > 0
        ? result.errors.map((e: any) => e.message).join(", ")
        : "Unknown error";

      throw new Error(`Failed to deploy worker: ${errorMsg}`);
    }

    // Default response
    const deployResponse = {
      success: true,
      action: workerExists ? "redeployed" : "deployed",
      name: scriptName,
    };

    // Always get the domain information
    try {
      const subdomainResult = await ctx.api
        ["GET /accounts/:account_id/workers/subdomain"]({
          account_id: accountId,
        }).then((res) => res.json());

      // Add domain information to the response if subdomain was successfully retrieved
      if (subdomainResult.success && subdomainResult.result?.subdomain) {
        return {
          ...deployResponse,
          domain:
            `${scriptName}.${subdomainResult.result.subdomain}.workers.dev`,
        };
      }
    } catch (error) {
      console.warn(`Failed to get workers.dev subdomain information: ${error}`);
    }

    return deployResponse;
  } catch (error) {
    throw new Error(
      `Deployment failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default action;
