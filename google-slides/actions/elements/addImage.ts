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
   * @description The ID of the slide to add the image to
   */
  slideId: string;

  /**
   * @title Image URL
   * @description URL of the image to add (must be publicly accessible)
   */
  imageUrl: string;

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
   * @description Width of the image in points (optional, will use original if not specified)
   */
  width?: number;

  /**
   * @title Height
   * @description Height of the image in points (optional, will use original if not specified)
   */
  height?: number;

  /**
   * @title Element ID
   * @description Optional ID for the image element. If not provided, one will be generated
   */
  elementId?: string;
}

interface AddImageResponse {
  elementId: string;
  presentationId: string;
  slideId: string;
  imageUrl: string;
}

/**
 * @title Add Image
 * @description Adds an image to a slide from a URL
 */
export default async function addImage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AddImageResponse> {
  const {
    presentationId,
    slideId,
    imageUrl,
    x = 100,
    y = 100,
    width,
    height,
    elementId,
  } = props;

  const imageId = elementId || `image_${Date.now()}`;

  // Build the element properties
  const elementProperties = {
    pageObjectId: slideId,
    transform: {
      scaleX: 1,
      scaleY: 1,
      translateX: x,
      translateY: y,
      unit: "PT",
    },
    ...(width && height && {
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
    }),
  };

  const requests: BatchRequest[] = [
    {
      createImage: {
        objectId: imageId,
        url: imageUrl,
        elementProperties,
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
    elementId: imageId,
    presentationId,
    slideId,
    imageUrl,
  };
}
