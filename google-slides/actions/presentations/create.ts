import type { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Presentation Title
   * @description The title for the new presentation
   */
  title: string;
}

interface CreateResponse {
  presentationId: string;
  title: string;
  url: string;
}

/**
 * @title Create Presentation
 * @description Creates a new Google Slides presentation
 */
export default async function createPresentation(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateResponse> {
  const { title } = props;

  const response = await ctx.client["POST /presentations"](
    {},
    {
      body: {
        title,
      },
    },
  );

  const presentation = await response.json();

  return {
    presentationId: presentation.presentationId,
    title: presentation.title,
    url:
      `https://docs.google.com/presentation/d/${presentation.presentationId}/edit`,
  };
}
