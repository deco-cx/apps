import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Access Token
   * @description Override access token for the request
   */
  accessToken?: string;
}

export interface FigmaUserInfo {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

/**
 * @title Get Current User (Whoami)
 * @description Retrieves the current user's information from Figma
 */
export default async function whoami(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaUserInfo> {
  try {
    // Use custom access token if provided, otherwise use context client
    let response;

    if (props.accessToken) {
      // Make direct fetch with custom token
      response = await fetch("https://api.figma.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${props.accessToken}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as FigmaUserInfo;
    } else {
      // Use context client
      response = await ctx.client["GET /v1/me"]({});

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as FigmaUserInfo;
    }
  } catch (error) {
    throw new Error(
      `Erro ao obter informações do usuário: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
