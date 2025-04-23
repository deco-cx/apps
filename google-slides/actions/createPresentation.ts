import type { AppContext } from "../mod.ts";
import type { Presentation } from "../utils/types.ts";

interface Props {
  /**
   * @title Presentation Title
   * @description The title of the new presentation
   */
  title: string;
  /**
   * @title Presentation ID
   * @description The ID of the presentation to retrieve
   */
  presentationId: string;
  token: string;
}

/**
 * @title Create Presentation
 * @description Creates a new Google Slides presentation
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Presentation> => {
  const response = await ctx.clientSlides["POST /v1/presentations"]({}, {
    headers: {
      Authorization: `Bearer ${props.token}`,
    },
    body: {
      title: props.title,
    },
  });

  return response.json();
};

export default action;
