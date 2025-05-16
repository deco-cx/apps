import type { AppContext } from "../../mod.ts";
import type {
  MessageResponse,
  Template,
  TemplateComponent,
} from "../../types.ts";

export interface Props {
  /**
   * @title Recipient Phone Number
   * @description The phone number of the recipient with country code (e.g., 551199999999)
   */
  to: string;

  /**
   * @title Template Name
   * @description Name of the template to use
   */
  templateName: string;

  /**
   * @title Language Code
   * @description The language and locale code for the template (e.g., en_US, pt_BR)
   */
  languageCode: string;

  /**
   * @title Header Parameters
   * @description JSON string of parameters for the header component (if any)
   */
  headerParams?: string;

  /**
   * @title Body Parameters
   * @description JSON string of parameters for the body component (if any)
   */
  bodyParams?: string;

  /**
   * @title Button Parameters
   * @description JSON string of parameters for button components (if any)
   */
  buttonParams?: string;

  /**
   * @title Template Namespace
   * @description The namespace of the template
   */
  namespace?: string;
}

// Extend the Template interface to include namespace
interface TemplateWithNamespace extends Template {
  namespace?: string;
}

/**
 * @title Send Template Message
 * @description Send a template message to a WhatsApp user
 */
export default async function sendTemplateMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const {
    to,
    templateName,
    languageCode,
    headerParams,
    bodyParams,
    buttonParams,
    namespace,
  } = props;

  const components: TemplateComponent[] = [];

  // Add header params if provided
  if (headerParams) {
    try {
      const params = JSON.parse(headerParams);
      components.push({
        type: "header",
        parameters: Array.isArray(params) ? params : [params],
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Invalid header parameters JSON: ${errorMessage}`);
    }
  }

  // Add body params if provided
  if (bodyParams) {
    try {
      const params = JSON.parse(bodyParams);
      components.push({
        type: "body",
        parameters: Array.isArray(params) ? params : [params],
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Invalid body parameters JSON: ${errorMessage}`);
    }
  }

  // Add button params if provided
  if (buttonParams) {
    try {
      const params = JSON.parse(buttonParams);
      const buttonsArray = Array.isArray(params) ? params : [params];

      buttonsArray.forEach((buttonParam, index) => {
        components.push({
          type: "button",
          sub_type: buttonParam.type || "quick_reply",
          index: index.toString(),
          parameters: [buttonParam],
        });
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Invalid button parameters JSON: ${errorMessage}`);
    }
  }

  const template: TemplateWithNamespace = {
    name: templateName,
    language: {
      code: languageCode,
    },
    components: components.length > 0 ? components : undefined,
  };

  // Add namespace if provided
  if (namespace) {
    template.namespace = namespace;
  }

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template,
  } as const;

  const response = await ctx.api["POST /:phone_number_id/messages"]({
    phone_number_id: ctx.phoneNumberId,
  }, {
    body,
  });

  return await response.json();
}
