import { AppContext } from "../../../mod.ts";

export interface Props {
  /**
   * @title Caption ID
   * @description ID of the caption track to download
   */
  id: string;

  /**
   * @title Format
   * @description Output format for the caption
   */
  tfmt?: "srt" | "vtt";

  /**
   * @title Translation Language
   * @description ISO 639-1 language code for caption translation
   */
  tlang?: string;

  /**
   * @title On Behalf Of Content Owner
   * @description Parameter for YouTube content partners
   */
  onBehalfOfContentOwner?: string;
}

/**
 * @name GET_CAPTION
 * @title Download Caption Track
 * @description Downloads a caption track in the specified format and language. If token issues occur, call another YouTube tool first to refresh the token.
 */
export default async function get(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { id, tfmt = "vtt", tlang, onBehalfOfContentOwner } = props;

  try {
    if (!ctx.tokens?.access_token) {
      throw new Error(
        "Authentication required. Please authenticate with YouTube first.",
      );
    }

    const accessToken = ctx.tokens.access_token;

    let url = `https://www.googleapis.com/youtube/v3/captions/${id}`;

    const params = new URLSearchParams();
    if (tfmt) params.append("tfmt", tfmt);
    if (tlang) params.append("tlang", tlang);
    if (onBehalfOfContentOwner) {
      params.append("onBehalfOfContentOwner", onBehalfOfContentOwner);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Authentication token expired or invalid. Please refresh your YouTube authentication.",
        );
      }

      if (response.status === 400 && tfmt !== "vtt") {
        const fallbackParams = new URLSearchParams();
        fallbackParams.append("tfmt", "vtt");
        if (tlang) fallbackParams.append("tlang", tlang);
        if (onBehalfOfContentOwner) {
          fallbackParams.append(
            "onBehalfOfContentOwner",
            onBehalfOfContentOwner,
          );
        }

        const fallbackUrl =
          `https://www.googleapis.com/youtube/v3/captions/${id}?${fallbackParams.toString()}`;

        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!fallbackResponse.ok) {
          let errorDetails = "";
          try {
            const errorJson = await fallbackResponse.json();
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = `Status code: ${fallbackResponse.status}`;
          }

          throw new Error(
            `Failed to fetch caption with fallback format: ${errorDetails}`,
          );
        }

        return await fallbackResponse.text();
      }

      let errorDetails = "";
      try {
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
      } catch {
        errorDetails = `Status code: ${response.status}`;
      }

      throw new Error(`Failed to fetch caption: ${errorDetails}`);
    }

    return await response.text();
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes("Authentication required") ||
        error.message.includes("token expired") ||
        error.message.includes("invalid"))
    ) {
      ctx.errorHandler.toHttpError(
        error,
        error.message,
        401,
      );
    }

    ctx.errorHandler.toHttpError(
      error,
      `Error fetching caption with ID ${id}`,
    );
  }
}
