import type { AppContext } from "../../mod.ts";
import type { Request as BatchRequest } from "../../utils/types.ts";
import { fetchSafe } from "../../../utils/fetch.ts";

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation to add the slide to
   */
  presentationId: string;

  /**
   * @title Insertion Index
   * @description Position where to insert the slide (0-based). If not provided, slide is added at the end
   */
  insertionIndex?: number;

  /**
   * @title Layout
   * @description Predefined layout for the slide
   * @default "BLANK"
   */
  layout?:
    | "BLANK"
    | "CAPTION_ONLY"
    | "TITLE"
    | "TITLE_AND_BODY"
    | "TITLE_AND_TWO_COLUMNS"
    | "TITLE_ONLY"
    | "SECTION_HEADER"
    | "SECTION_TITLE_AND_DESCRIPTION"
    | "ONE_COLUMN_TEXT"
    | "MAIN_POINT"
    | "BIG_NUMBER";

  /**
   * @title Slide ID
   * @description Optional ID for the new slide. If not provided, one will be generated
   */
  slideId?: string;
}

interface CreateSlideResponse {
  slideId: string;
  presentationId: string;
  insertionIndex: number;
  layout: string;
}

/**
 * @title Create Slide
 * @description Creates a new slide in a Google Slides presentation
 */
export default async function createSlide(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateSlideResponse> {
  const {
    presentationId,
    insertionIndex,
    layout = "BLANK",
    slideId,
  } = props;

  const slideObjectId = slideId || `slide_${Date.now()}`;

  const requests: BatchRequest[] = [{
    createSlide: {
      objectId: slideObjectId,
      insertionIndex,
      slideLayoutReference: {
        predefinedLayout: layout,
      },
    },
  }];

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
  const createSlideResponse = result.replies?.[0]?.createSlide;

  return {
    slideId: createSlideResponse?.objectId || slideObjectId,
    presentationId,
    insertionIndex: insertionIndex ?? 0,
    layout,
  };
}
