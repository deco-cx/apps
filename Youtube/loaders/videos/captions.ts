import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { YouTubeCaptionListResponse } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface VideoCaptionsOptions {
  /**
   * @description Video ID to fetch captions for
   */
  videoId: string;

  /**
   * @description Specific caption ID (optional)
   */
  captionId?: string;

  /**
   * @description Caption output format (default: srt)
   */
  format?: "srt" | "sbv" | "vtt";

  /**
   * @description Language code for translation (optional)
   */
  translationLanguage?: string;

  /**
   * @description Preferred language code to fetch caption directly (optional)
   * @example "pt" for Portuguese, "en" for English, etc.
   */
  preferredLanguage?: string;

  /**
   * @description If true, automatically loads the first available caption
   * @default true
   */
  autoLoadCaption?: boolean;

  /**
   * @description YouTube access token (optional)
   */
  tokenYoutube?: string;

  /**
   * @description Opção para ignorar cache em casos específicos
   */
  skipCache?: boolean;
}

export interface ParsedCaption {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface CaptionResponse {
  available: YouTubeCaptionListResponse;
  
  plainText?: string;
  
  parsed?: ParsedCaption[];
  
  loadedCaptionId?: string;
  
  format?: "srt" | "sbv" | "vtt";

  error?: {
    code: number;
    message: string;
    details?: string;
  };
}

/**
 * @title YouTube Video Captions
 * @description Fetches available captions for a specific video and optionally returns the complete text of a caption.
 * If only videoId is provided, returns the list of available captions and auto-loads the first one.
 * If captionId is provided, also returns the full text of that caption.
 * If preferredLanguage is provided, tries to load a caption in that language.
 */
export default async function loader(
  { videoId, captionId, format = "srt", translationLanguage, preferredLanguage, autoLoadCaption = true, tokenYoutube, skipCache = false }: VideoCaptionsOptions,
  req: Request,
  ctx: AppContext,
): Promise<CaptionResponse | null> {
  const client = ctx.client;
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    return createErrorResponse(401, "Authentication required to get video captions");
  }

  if (!videoId) {
    return createErrorResponse(400, "Video ID is required");
  }

  try {
    const captionsListResponse = await client["GET /captions"]({
      part: "snippet",
      videoId,
    }, { 
      headers: { Authorization: `Bearer ${accessToken}` },
      ...STALE 
    });
    
    if (!captionsListResponse.ok) {
      const errorData = await captionsListResponse.json();
      return createErrorResponse(
        captionsListResponse.status, 
        "Failed to fetch captions list", 
        JSON.stringify(errorData)
      );
    }

    const captionsList = await captionsListResponse.json() as YouTubeCaptionListResponse;
    
    const response: CaptionResponse = {
      available: captionsList.items?.length > 0 
        ? captionsList 
        : { kind: "youtube#captionListResponse", etag: "", items: [] },
    };

    const targetCaptionId = captionId || findCaptionToLoad(response.available, preferredLanguage, autoLoadCaption);
    
    if (targetCaptionId) {
      await loadCaption(client, accessToken, targetCaptionId, format, translationLanguage, response);
    }
    
    return response;
  } catch (error) {
    return createErrorResponse(
      500, 
      `Error fetching captions for video ${videoId}`, 
      error instanceof Error ? error.message : String(error)
    );
  }
}

function findCaptionToLoad(
  available: YouTubeCaptionListResponse, 
  preferredLanguage?: string, 
  autoLoadCaption = true
): string | undefined {
  if (!autoLoadCaption || !available.items?.length) return undefined;
  
  if (preferredLanguage) {
    const preferredCaption = available.items.find(
      item => item.snippet.language.startsWith(preferredLanguage)
    );
    if (preferredCaption) return preferredCaption.id;
  }
  
  return available.items[0]?.id;
}

async function loadCaption(
  client: any,
  accessToken: string,
  captionId: string,
  format: "srt" | "sbv" | "vtt",
  translationLanguage: string | undefined,
  response: CaptionResponse
): Promise<void> {
  try {
    const captionParams: Record<string, string> = { tfmt: format };
    if (translationLanguage) {
      captionParams.tlang = translationLanguage;
    }

    const captionResponse = await client["GET /captions/:id"]({
      id: captionId,
      ...captionParams
    }, { 
      headers: { Authorization: `Bearer ${accessToken}` },
      ...STALE
    });

    if (captionResponse.ok) {
      const captionText = await captionResponse.text();
      response.loadedCaptionId = captionId;
      response.format = format;

      response.parsed = parseCaption(captionText, format);
      
      if (response.parsed) {
        response.plainText = extractPlainText(response.parsed);
      }
    } else {
      await handleCaptionError(captionResponse, response);
    }
  } catch (error) {
    response.error = {
      code: 500,
      message: "Error requesting specific caption",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseCaption(text: string, format: "srt" | "sbv" | "vtt"): ParsedCaption[] {
  switch (format) {
    case "srt": return parseSrtCaption(text);
    case "sbv": return parseSbvCaption(text);
    case "vtt": return parseVttCaption(text);
    default: return parseSrtCaption(text);
  }
}

async function handleCaptionError(captionResponse: Response, response: CaptionResponse): Promise<void> {
  try {
    const errorData = await captionResponse.json() as {
      error?: {
        errors?: Array<{
          domain: string;
          reason: string;
        }>
      }
    };
    
    const isPermissionError = 
      errorData?.error?.errors?.some((e) => 
        e.domain === "youtube.caption" && e.reason === "forbidden");
    
    response.error = {
      code: captionResponse.status,
      message: isPermissionError 
        ? "You don't have permission to access this caption. The video owner may have restricted caption access."
        : "Failed to fetch caption text",
      details: JSON.stringify(errorData),
    };
  } catch (parseError) {
    const errorText = await captionResponse.text();
    response.error = {
      code: captionResponse.status,
      message: "Failed to fetch caption text",
      details: errorText,
    };
  }
}

function createErrorResponse(code: number, message: string, details?: string): CaptionResponse {
  return {
    available: { kind: "youtube#captionListResponse", etag: "", items: [] },
    error: { code, message, details }
  };
}

function parseSrtCaption(text: string): ParsedCaption[] {
  const captions: ParsedCaption[] = [];
  const blocks = text.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    const timecodes = lines[1].split(" --> ");
    const startTime = timecodes[0];
    const endTime = timecodes[1];
    const textLines = lines.slice(2);

    captions.push({
      index,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return captions;
}

function parseSbvCaption(text: string): ParsedCaption[] {
  const captions: ParsedCaption[] = [];
  const blocks = text.trim().split(/\r?\n\r?\n/);
  let index = 1;

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length < 2) continue;

    const timecodes = lines[0].split(",");
    const startTime = timecodes[0];
    const endTime = timecodes[1];
    const textLines = lines.slice(1);

    captions.push({
      index: index++,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return captions;
}

function parseVttCaption(text: string): ParsedCaption[] {
  const captions: ParsedCaption[] = [];
  const blocks = text.trim().split(/\r?\n\r?\n/);
  let index = 1;

  for (let i = 1; i < blocks.length; i++) {
    const lines = blocks[i].split(/\r?\n/);
    if (lines.length < 2) continue;

    let timeCodeLineIndex = 0;

    if (!lines[0].includes("-->")) {
      timeCodeLineIndex = 1;
    }

    if (timeCodeLineIndex >= lines.length) continue;

    const timecodes = lines[timeCodeLineIndex].split(" --> ");
    const startTime = timecodes[0];
    const endTime = timecodes[1];
    const textLines = lines.slice(timeCodeLineIndex + 1);

    captions.push({
      index: index++,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return captions;
}

function extractPlainText(parsed: ParsedCaption[] | undefined): string {
  if (!parsed || parsed.length === 0) {
    return "";
  }
  
  const fullText = parsed.map(caption => caption.text.trim()).join(" ");
  
  return fullText
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\d+:\d+:\d+,\d+/g, "")
    .replace(/\d+:\d+:\d+\.\d+/g, "")
    .replace(/\d+:\d+,\d+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Define a estratégia de cache padrão como stale-while-revalidate
export const cache = "stale-while-revalidate";

// Define a chave de cache com base nos parâmetros da requisição
export const cacheKey = (props: VideoCaptionsOptions, req: Request, ctx: AppContext) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  
  // Não fazer cache se não houver token ou videoId
  if (!accessToken || !props.videoId) {
    return null;
  }
  
  // Cria parâmetros para a chave de cache
  const params = new URLSearchParams([
    ["videoId", props.videoId],
    ["captionId", props.captionId || ""],
    ["format", props.format || "srt"],
    ["translationLanguage", props.translationLanguage || ""],
    ["preferredLanguage", props.preferredLanguage || ""],
    ["autoLoadCaption", (props.autoLoadCaption ?? true).toString()],
  ]);
  
  // Se skipCache for true, não usamos cache
  if (props.skipCache) {
    return null;
  }
  
  // Ordenamos os parâmetros para garantir consistência na chave de cache
  params.sort();
  
  // Retornamos uma string única que identificará este conjunto de parâmetros
  return `youtube-captions-${params.toString()}`;
};
