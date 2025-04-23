import type { AppContext } from "../mod.ts";
import type { Presentation } from "../utils/types.ts";

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation to add the slide to
   */
  presentationId: string;

  /**
   * @title Layout
   * @description The predefined layout to use for the new slide
   */
  layout: "TITLE" | "MAIN" | "SECTION_HEADER" | "TITLE_AND_BODY" | "BLANK";

  /**
   * @title Insertion Index
   * @description The zero-based index where to insert the new slide (optional)
   */
  insertionIndex?: number;

  /**
   * @title Token
   * @description The token to use for the request
   */
  token: string;
}

/**
 * @title Add Slide
 * @description Adds a new slide to an existing presentation
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Presentation> => {
  const response = await ctx.clientSlides
    ["POST /v1/presentations/:presentationId"]({
      presentationId: props.presentationId + ":batchUpdate",
    }, {
      headers: {
        Authorization: `Bearer ${props.token}`,
      },
      body: {
        requests: [
          {
            createSlide: {
              insertionIndex: props.insertionIndex,
              slideLayoutReference: {
                predefinedLayout: props.layout,
              },
            },
          },
        ],
      },
    });

  const data = await response.json();
  return {
    ...data,
    title: "",
  };
};

export default action;
