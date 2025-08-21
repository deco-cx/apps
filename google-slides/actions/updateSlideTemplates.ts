import type { AppContext } from "../mod.ts";
import type { Request as BatchRequest } from "../utils/types.ts";
import { fetchSafe } from "../../utils/fetch.ts";

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
   * @title Slide ID
   * @description The ID of the slide to update (optional, if not provided all slides with templates will be updated)
   */
  slideId?: string;

  /**
   * @title Template Values
   * @description Values to replace the template placeholders with
   */
  templateValues: TemplateValue[];
}

interface UpdateResponse {
  presentationId: string;
  updatedSlides: string[];
}

/**
 * @title Update Slide Templates
 * @description Updates slides by replacing template placeholders with actual values
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateResponse> => {
  // First, get the slides with templates
  const getResponse = await ctx.client
    ["GET /presentations/:presentationId"](
      { presentationId: props.presentationId },
    );

  const presentationData = await getResponse.json();

  // Build the requests array for the batch update
  const requests: BatchRequest[] = [];
  const updatedSlideIds: string[] = [];

  // Process each slide in the presentation
  if (presentationData.slides) {
    for (const slide of presentationData.slides) {
      // Skip if a specific slideId was provided and this isn't it
      if (props.slideId && props.slideId !== slide.objectId) {
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
                let contentUpdated = false;

                for (const templateValue of props.templateValues) {
                  const placeholder = `{{${templateValue.name}}}`;
                  if (content.includes(placeholder)) {
                    content = content.replace(
                      new RegExp(placeholder, "g"),
                      templateValue.value,
                    );
                    contentUpdated = true;
                  }
                }

                if (contentUpdated) {
                  hasUpdates = true;
                }

                updatedText += content;
              } else {
                // Preserve non-text run elements in the output
                updatedText += textElement.textRun?.content || "";
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
    // Make direct API call since httpClient doesn't handle :batchUpdate endpoints properly
    const url =
      `https://slides.googleapis.com/v1/presentations/${props.presentationId}:batchUpdate`;
    const accessToken = ctx.client.oauth.tokens.access_token;

    const updateResponse = await fetchSafe(url, {
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

    await updateResponse.json();
  }

  return {
    presentationId: props.presentationId,
    updatedSlides: updatedSlideIds,
  };
};

export default action;
