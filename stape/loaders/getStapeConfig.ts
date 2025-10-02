import { AppContext } from "../mod.ts";
import { Container } from "../utils/types.ts";

export interface Props {
  /**
   * @title Container ID
   * @description The Stape container identifier
   */
  containerId?: string;
}

// Type guards and utility functions
const hasRequiredCredentials = (ctx: AppContext): boolean =>
  !!ctx.apiKey && !!ctx.api;

const logCredentialWarning = (apiKey?: string, api?: unknown) => {
  if (!apiKey) console.warn("Stape API key not configured");
  if (!api) console.warn("Stape API client not available");
};

const handleApiError = async (
  response: Response,
  operation: string,
): Promise<Container | null> => {
  if (response.status === 404) return null;

  const errorText = await response.text().catch(() => "Unknown error");
  console.error(`Stape ${operation} failed:`, response.status, errorText);
  return null;
};

const fetchSpecificContainer = async (
  api: AppContext["api"],
  containerId: string,
): Promise<Container | null> => {
  try {
    const response = await api["GET /api/v2/containers/:identifier"]({
      identifier: containerId,
    });

    if (!response.ok) {
      return handleApiError(response, "container lookup");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch specific container:", error);
    return null;
  }
};

const fetchFirstContainer = async (
  api: AppContext["api"],
): Promise<Container | null> => {
  try {
    const response = await api["GET /api/v2/containers"]({});

    if (!response.ok) {
      return handleApiError(response, "containers list");
    }

    const containers = await response.json();
    return containers.length > 0 ? containers[0] : null;
  } catch (error) {
    console.error("Failed to fetch containers list:", error);
    return null;
  }
};

/**
 * @title Get Stape Container Configuration
 * @description Retrieves Stape container configuration and status information
 */
const getStapeConfig = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Container | null> => {
  const { api, apiKey } = ctx;

  // Early return if credentials are missing
  if (!hasRequiredCredentials(ctx)) {
    logCredentialWarning(apiKey, api);
    return null;
  }

  // Route to appropriate fetch function based on props
  return props.containerId
    ? await fetchSpecificContainer(api, props.containerId)
    : await fetchFirstContainer(api);
};

export default getStapeConfig;
