// deno-lint-ignore-file no-explicit-any
import type { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation to retrieve
   */
  presentationId: string;
  token: string;
}

interface SlideContent {
  id: string;
  text: string;
  names: string[]; // Renamed from 'name' to 'names' to indicate multiple template names
}

/**
 * @title Fetch Presentation Google Slides
 * @description Retrieves a Google Slides presentation by ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlideContent[]> => {
  const response = await ctx.clientSlides
    ["GET /v1/presentations/:presentationId"](
      { presentationId: props.presentationId },
      {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      },
    );

  const data = await response.json();

  const slides: SlideContent[] = data.slides?.flatMap((slide: any) => {
    const slideId = slide.objectId;
    const contents = slide.pageElements?.map((element: any) => {
      if (element.shape?.text?.textElements) {
        return element.shape.text.textElements
          .filter((textElement: any) => textElement.textRun?.content)
          .map((textElement: any) => textElement.textRun.content)
          .join(" ");
      }
      return null;
    }).filter(Boolean).join(" ");

    if (contents && contents.includes("{{")) {
      // Extract template variables
      const templateVarRegex = /{{([^}]+)}}/g;
      const matches = [...contents.matchAll(templateVarRegex)];

      if (matches.length > 0) {
        // Extract all template names found
        const templateNames = matches.map((match) => match[1].trim());

        return {
          id: slideId,
          text: contents,
          names: templateNames,
        };
      }
    }
    return [];
  }) || [];

  return slides;
};

export default loader;
