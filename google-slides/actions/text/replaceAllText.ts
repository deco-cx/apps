import type { AppContext } from "../../mod.ts";
import type { Request as BatchRequest } from "../../utils/types.ts";
import { fetchSafe } from "../../../utils/fetch.ts";

interface TextReplacement {
  /**
   * @title Find Text
   * @description The text to find and replace
   */
  findText: string;

  /**
   * @title Replace With
   * @description The text to replace it with
   */
  replaceText: string;

  /**
   * @title Match Case
   * @description Whether the search should be case sensitive
   * @default false
   */
  matchCase?: boolean;
}

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation
   */
  presentationId: string;

  /**
   * @title Text Replacements
   * @description Array of text replacements to perform
   */
  replacements: TextReplacement[];
}

interface ReplaceAllTextResponse {
  presentationId: string;
  replacements: {
    findText: string;
    replaceText: string;
    occurrencesChanged: number;
  }[];
  totalReplacements: number;
}

/**
 * @title Replace All Text
 * @description Replaces all instances of specified text throughout the presentation
 */
export default async function replaceAllText(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReplaceAllTextResponse> {
  const { presentationId, replacements } = props;

  // Build requests for each replacement
  const requests: BatchRequest[] = replacements.map((replacement) => ({
    replaceAllText: {
      containsText: {
        text: replacement.findText,
        matchCase: replacement.matchCase || false,
      },
      replaceText: replacement.replaceText,
    },
  }));

  // Make direct API call since httpClient doesn't handle :batchUpdate endpoints properly
  const url =
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`;
  const accessToken = ctx.client.oauth.tokens.access_token;

  const response = await fetchSafe(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      requests,
    }),
  });

  const result = await response.json();

  // Parse the response to get replacement counts
  const replacementResults = replacements.map((replacement, index) => {
    const reply = result.replies?.[index]?.replaceAllText;
    return {
      findText: replacement.findText,
      replaceText: replacement.replaceText,
      occurrencesChanged: reply?.occurrencesChanged || 0,
    };
  });

  const totalReplacements = replacementResults.reduce(
    (total, result) => total + result.occurrencesChanged,
    0,
  );

  return {
    presentationId,
    replacements: replacementResults,
    totalReplacements,
  };
}
