import { AppContext } from "../../mod.ts";
import { SpotifyUser } from "../../client.ts";

/**
 * @title Who Am I
 * @description Get information about the current authenticated user
 */
export default async function whoami(
  _props: {},
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyUser> {
  const response = await ctx.api["GET /me"]({});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting user: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
