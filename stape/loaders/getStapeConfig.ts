import { AppContext } from "../mod.ts";
import { Container } from "../utils/types.ts";

export interface Props {
  /**
   * @title Container ID
   * @description The Stape container identifier
   */
  containerId?: string;
}

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

  if (!apiKey) {
    console.warn("Stape API key not configured");
    return null;
  }
  if (!api) {
    console.warn("Stape API client not available");
    return null;
  }
  try {
    if (props.containerId) {
      // Get specific container
      const response = await api["GET /api/v2/containers/:identifier"]({
        identifier: props.containerId,
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        console.error(
          "Stape container lookup failed:",
          response.status,
          await response.text(),
        );
        return null;
      }
      return await response.json();
    } else {
      // Get all containers and return the first one
      const response = await api["GET /api/v2/containers"]({});
      const containers = await response.json();
      return containers.length > 0 ? containers[0] : null;
    }
  } catch (error) {
    console.error("Failed to fetch Stape container info:", error);
    return null;
  }
};

export default getStapeConfig;
