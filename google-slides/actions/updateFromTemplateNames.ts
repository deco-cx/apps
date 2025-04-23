import type { AppContext } from "../mod.ts";
import type { Request as SlideRequest } from "../utils/types.ts";
import getSlideTemplates from "../loaders/presentation/get.ts";

interface TemplateValue {
  name: string;
  value: string;
}

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation to update
   */
  presentationId: string;

  /**
   * @title Template Values
   * @description Values to replace the template placeholders with
   */
  templateValues: TemplateValue[];

  /**
   * @title Token
   * @description The token to use for the request
   */
  token: string;
}

interface UpdateResponse {
  presentationId: string;
  updatedSlides: string[];
  templateResults: {
    id: string;
    names: string[];
    used: boolean;
  }[];
}

/**
 * @title Update Presentation from Template Names
 * @description First gets all slides with templates then updates them with provided values
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<UpdateResponse> => {
  try {
    // First, get all the slides with templates
    const slidesWithTemplates = await getSlideTemplates(
      { presentationId: props.presentationId, token: props.token },
      req,
      ctx,
    );

    // Create a template results array to track which templates were used
    const templateResults = slidesWithTemplates.map((slide) => ({
      id: slide.id,
      names: slide.names,
      used: false,
    }));

    // Build the requests array for the batch update
    const requests: SlideRequest[] = [];
    const updatedSlideIds: string[] = [];

    // Get the full presentation to access the elements
    const getResponse = await ctx.clientSlides
      ["GET /v1/presentations/:presentationId"](
        { presentationId: props.presentationId },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      );

    const presentationData = await getResponse.json();

    // Process each slide in the presentation
    if (presentationData.slides) {
      for (const slide of presentationData.slides) {
        // Check if this slide is in our template list
        const templateSlide = slidesWithTemplates.find((s) =>
          s.id === slide.objectId
        );
        if (!templateSlide) {
          continue;
        }

        // Find text elements that need updating
        if (slide.pageElements) {
          for (const element of slide.pageElements) {
            if (element.shape?.text?.textElements) {
              let hasUpdates = false;
              let updatedText = "";

              // Check if any text elements have template variables
              for (const textElement of element.shape.text.textElements) {
                if (textElement.textRun?.content) {
                  let content = textElement.textRun.content;

                  // Check if this content has any template variables
                  for (const templateValue of props.templateValues) {
                    const placeholder = `{{${templateValue.name}}}`;

                    // Only replace if this template name exists in the slide's names
                    if (
                      templateSlide.names.includes(templateValue.name) &&
                      content.includes(placeholder)
                    ) {
                      content = content.replace(
                        new RegExp(placeholder, "g"),
                        templateValue.value,
                      );
                      hasUpdates = true;

                      // Mark this template as used
                      const resultIndex = templateResults.findIndex((r) =>
                        r.id === slide.objectId
                      );
                      if (resultIndex >= 0) {
                        templateResults[resultIndex].used = true;
                      }
                    }
                  }

                  updatedText += content;
                }
              }

              // If updates were made, add a request to update this element
              if (hasUpdates) {
                requests.push({
                  deleteText: {
                    objectId: element.objectId,
                    textRange: {
                      type: "ALL",
                    },
                  },
                });

                requests.push({
                  insertText: {
                    objectId: element.objectId,
                    text: updatedText,
                  },
                });

                if (!updatedSlideIds.includes(slide.objectId)) {
                  updatedSlideIds.push(slide.objectId);
                }
              }
            }
          }
        }
      }
    }

    // Only proceed if there are updates to make
    if (requests.length > 0) {
      console.log("Sending batch update with", requests.length, "requests");

      // Ajuste para usar a API do Google Slides corretamente
      const updateUrl =
        `https://slides.googleapis.com/v1/presentations/${props.presentationId}:batchUpdate`;

      const updateResponse = await fetch(updateUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${props.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          requests: requests,
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(
          `Error updating presentation: ${updateResponse.status} ${errorText}`,
        );
      }

      await updateResponse.json();
    }

    return {
      presentationId: props.presentationId,
      updatedSlides: updatedSlideIds,
      templateResults,
    };
  } catch (error) {
    console.error("Error in updateFromTemplateNames:", error);
    throw error;
  }
};

export default action;
