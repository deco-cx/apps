import type { AppContext } from "../mod.ts";

export interface Props {
  // No props needed to get user connections
}

export interface DiscordConnection {
  id: string;
  name: string;
  type: string;
  revoked?: boolean;
  integrations?: any[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  two_way_link: boolean;
  visibility: number;
}

/**
 * @title Get User Connections
 * @description Get user's connected third-party accounts (OAuth - scope: connections)
 */
export default async function getUserConnections(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordConnection[]> {
  const { client } = ctx;

  // Get user's third-party connections
  const response = await client["GET /users/@me/connections"]({});

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get user connections: ${response.statusText}`,
    );
  }

  const connections = await response.json();
  return connections;
}