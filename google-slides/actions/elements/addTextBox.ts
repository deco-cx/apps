import type { AppContext } from "../../mod.ts";
import type { Request as BatchRequest } from "../../utils/types.ts";
import { fetchSafe } from "../../../utils/fetch.ts";

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation
   */
  presentationId: string;

  /**
   * @title Slide ID
   * @description The ID of the slide to add the text box to
   */
  slideId: string;

  /**
   * @title Text
   * @description The text content for the text box
   */
  text: string;

  /**
   * @title X Position
   * @description X coordinate position in points
   * @default 100
   */
  x?: number;

  /**
   * @title Y Position
   * @description Y coordinate position in points
   * @default 100
   */
  y?: number;

  /**
   * @title Width
   * @description Width of the text box in points
   * @default 300
   */
  width?: number;

  /**
   * @title Height
   * @description Height of the text box in points
   * @default 150
   */
  height?: number;

  /**
   * @title Element ID
   * @description Optional ID for the text box element. If not provided, one will be generated
   */
  elementId?: string;
}

interface AddTextBoxResponse {
  elementId: string;
  presentationId: string;
  slideId: string;
  text: string;
}

/**
 * @title Add Text Box
 * @description Adds a text box with content to a slide
 */
export default async function addTextBox(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AddTextBoxResponse> {
  const {
    presentationId,
    slideId,
    text,
    x = 100,
    y = 100,
    width = 300,
    height = 150,
    elementId,
  } = props;

  const textBoxId = elementId || `textbox_${Date.now()}`;

  const requests: BatchRequest[] = [
    // First request: Create the text box shape
    {
      createShape: {
        objectId: textBoxId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: {
              magnitude: width,
              unit: "PT",
            },
            height: {
              magnitude: height,
              unit: "PT",
            },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: x,
            translateY: y,
            unit: "PT",
          },
        },
      },
    },
    // Second request: Insert text into the text box
    {
      insertText: {
        objectId: textBoxId,
        text,
        insertionIndex: 0,
      },
    },
  ];

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

  await response.json();

  return {
    elementId: textBoxId,
    presentationId,
    slideId,
    text,
  };
}
