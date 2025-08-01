import { AppContext } from "../../mod.ts";
import { DiscordUser } from "../../utils/types.ts";

export interface Props {
  accessToken?: string;
}

/**
 * @title whoami
 * @description Retrieves the current Discord user's information
 */
export default async function whoami(
  { accessToken }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser> {
  const { client } = ctx;

  try {
    const response = await client["GET /users/@me"]({}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    throw ctx.errorHandler.toHttpError(
      error,
      "Failed to get current Discord user information",
    );
  }
}
