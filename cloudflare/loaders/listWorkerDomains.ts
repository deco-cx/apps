import { AppContext } from "../mod.ts";
import { ListWorkerDomainsResponse } from "../client.ts";

export interface Props {
  /**
   * @title Account ID
   * @description Use a specific account ID (overrides app settings)
   */
  accountId?: string;

  /**
   * @title Zone Name
   * @description Filter by zone name (e.g., example.com)
   */
  zoneName?: string;

  /**
   * @title Service
   * @description Filter by Worker service name
   */
  service?: string;

  /**
   * @title Zone ID
   * @description Filter by zone ID
   */
  zoneId?: string;

  /**
   * @title Hostname
   * @description Filter by hostname (e.g., foo.example.com)
   */
  hostname?: string;

  /**
   * @title Environment
   * @description Filter by Worker environment
   */
  environment?: string;
}

/**
 * @title List Worker Domains
 * @description Lists all Worker Domains for an account with optional filtering
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListWorkerDomainsResponse> => {
  // Use the provided account ID or fall back to the one in app context
  const accountId = props.accountId || ctx.accountId;

  // Extract optional filter parameters
  const { zoneName, service, zoneId, hostname, environment } = props;

  // Build search parameters
  const searchParams: Record<string, string> = {};

  if (zoneName) searchParams.zone_name = zoneName;
  if (service) searchParams.service = service;
  if (zoneId) searchParams.zone_id = zoneId;
  if (hostname) searchParams.hostname = hostname;
  if (environment) searchParams.environment = environment;

  // Make the API request
  const response = await ctx.api["GET /accounts/:account_id/workers/domains"]({
    account_id: accountId,
    ...searchParams,
  });

  return await response.json();
};

export default loader;
