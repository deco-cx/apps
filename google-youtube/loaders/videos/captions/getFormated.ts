import { AppContext } from "../../../mod.ts";
import { YouTubeCaptionListResponse } from "../../../utils/types.ts";
import { COMMON_ERROR_MESSAGES } from "../../../utils/constant.ts";

export interface Props {
  /**
   * @title Video ID
   * @description Video ID to fetch captions for
   */
  videoId: string;

  /**
   * @title Caption ID
   * @description Specific caption ID to fetch
   */
  captionId?: string;

  /**
   * @title Format
   * @description Caption output format
   */
  format?: "srt" | "sbv" | "vtt";

  /**
   * @title Auto Load Caption
   * @description If true, automatically loads the first available caption
   */
  autoLoadCaption?: boolean;
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
}

/**
 * @name GET_VIDEO_CAPTIONS
 * @title Get Video Captions
 * @description Fetches available captions for a specific video and optionally returns the complete text
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CaptionResponse> => {
  const {
    videoId,
    captionId,
    format = "srt",
    autoLoadCaption = true,
  } = props;

  if (!videoId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID),
      COMMON_ERROR_MESSAGES.MISSING_VIDEO_ID,
    );
  }

  try {
    const captionsListResponse = await ctx.invoke["google-youtube"].loaders
      .videos.captions.list(
        {
          videoId,
        },
      );

    const captionsList = captionsListResponse;

    const response: CaptionResponse = {
      available: captionsList.items?.length > 0
        ? captionsList
        : { kind: "youtube#captionListResponse", etag: "", items: [] },
    };

    const targetCaptionId = captionId ||
      findCaptionToLoad(response.available, autoLoadCaption);

    if (targetCaptionId) {
      await loadCaption(
        ctx,
        response,
        targetCaptionId,
        format,
      );
    }

    return response;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to fetch captions for video ${videoId}`,
    );
  }
};

function findCaptionToLoad(
  available: YouTubeCaptionListResponse,
  autoLoadCaption = true,
): string | undefined {
  if (!autoLoadCaption || !available.items?.length) return undefined;

  return available.items[0]?.id;
}

async function loadCaption(
  ctx: AppContext,
  response: CaptionResponse,
  captionId: string,
  format: "srt" | "sbv" | "vtt",
): Promise<void> {
  try {
    const captionText = await ctx.invoke["google-youtube"].loaders.videos
      .captions.get({
        id: captionId,
      });

    response.loadedCaptionId = captionId;
    response.format = format;

    response.parsed = parseCaption(captionText, format);

    if (response.parsed) {
      response.plainText = extractPlainText(response.parsed);
    }
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process caption",
    );
  }
}

function parseCaption(
  text: string,
  format: "srt" | "sbv" | "vtt",
): ParsedCaption[] {
  switch (format) {
    case "srt":
      return parseSrtCaption(text);
    case "sbv":
      return parseSbvCaption(text);
    case "vtt":
      return parseVttCaption(text);
    default:
      return parseSrtCaption(text);
  }
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
  const lines = text.trim().split(/\r?\n/);
  let index = 1;
  let i = 0;

  if (lines[0].includes("WEBVTT")) {
    i = 1;
  }

  while (i < lines.length) {
    if (!lines[i] || lines[i].trim() === "") {
      i++;
      continue;
    }

    const timeLine = lines[i];
    if (timeLine.includes("-->")) {
      const timecodes = timeLine.split(" --> ");
      const startTime = timecodes[0].trim();
      const endTime = timecodes[1].trim().split(" ")[0];

      let textContent = "";
      i++;
      while (i < lines.length && lines[i] && lines[i].trim() !== "") {
        textContent += (textContent ? "\n" : "") + lines[i];
        i++;
      }

      captions.push({
        index: index++,
        startTime,
        endTime,
        text: textContent,
      });
    } else {
      i++;
    }
  }

  return captions;
}

function extractPlainText(parsed: ParsedCaption[] | undefined): string {
  if (!parsed) return "";
  return parsed.map((caption) => caption.text).join("\n");
}

export default loader;
