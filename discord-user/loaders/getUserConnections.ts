import type { AppContext } from "../mod.ts";

export interface DiscordConnection {
  id: string;
  name: string;
  type: string;
  revoked?: boolean;
  integrations?: unknown[];
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
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordConnection[]> {
  const { client } = ctx;

  const response = await client["GET /users/@me/connections"]({});

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get user connections: ${response.statusText}`,
    );
  }
  return await response.json();
}
