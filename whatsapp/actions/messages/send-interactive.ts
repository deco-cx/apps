import type { AppContext } from "../../mod.ts";
import type {
  Button,
  InteractiveBody,
  InteractiveFooter,
  InteractiveHeader,
  MessageResponse,
  Section,
} from "../../client.ts";

export type InteractiveType = "button" | "list";

export interface Props {
  /**
   * @title Recipient Phone Number
   * @description The phone number of the recipient with country code (e.g., 551199999999)
   */
  to: string;

  /**
   * @title Interactive Type
   * @description The type of interactive message to send
   */
  interactiveType: InteractiveType;

  /**
   * @title Body Text
   * @description The main message text
   */
  bodyText: string;

  /**
   * @title Header Text
   * @description Optional text to display in the header
   */
  headerText?: string;

  /**
   * @title Footer Text
   * @description Optional text to display in the footer
   */
  footerText?: string;

  /**
   * @title Button Text
   * @description The text on the main button (for list messages)
   */
  buttonText?: string;

  /**
   * @title Buttons
   * @description JSON string representing the buttons (for button messages)
   * @example [{"type":"reply","reply":{"id":"btn1","title":"Yes"}},{"type":"reply","reply":{"id":"btn2","title":"No"}}]
   */
  buttons?: string;

  /**
   * @title Sections
   * @description JSON string representing the sections (for list messages)
   * @example [{"title":"Section 1","rows":[{"id":"row1","title":"Option 1","description":"Description 1"},{"id":"row2","title":"Option 2"}]}]
   */
  sections?: string;

  /**
   * @title Reply To Message ID
   * @description The ID of a message to reply to
   */
  replyToMessageId?: string;
}

/**
 * @title Send Interactive Message
 * @description Send an interactive message with buttons or a list
 */
export default async function sendInteractiveMessage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MessageResponse> {
  const {
    to,
    interactiveType,
    bodyText,
    headerText,
    footerText,
    buttonText,
    buttons,
    sections,
    replyToMessageId,
  } = props;

  if (interactiveType === "button" && !buttons) {
    throw new Error(
      "Buttons are required for 'button' type interactive messages",
    );
  }

  if (interactiveType === "list" && (!sections || !buttonText)) {
    throw new Error(
      "Sections and buttonText are required for 'list' type interactive messages",
    );
  }

  // Build body
  const body: InteractiveBody = {
    text: bodyText,
  };

  // Build header if headerText is provided
  let header: InteractiveHeader | undefined;
  if (headerText) {
    header = {
      type: "text",
      text: headerText,
    };
  }

  // Build footer if footerText is provided
  let footer: InteractiveFooter | undefined;
  if (footerText) {
    footer = {
      text: footerText,
    };
  }

  // Parse buttons or sections based on interactive type
  const action: Record<string, unknown> = {};

  if (interactiveType === "button" && buttons) {
    try {
      const parsedButtons: Button[] = JSON.parse(buttons);
      action.buttons = parsedButtons;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Invalid buttons JSON: ${errorMessage}`);
    }
  } else if (interactiveType === "list" && sections && buttonText) {
    try {
      const parsedSections: Section[] = JSON.parse(sections);
      action.button = buttonText;
      action.sections = parsedSections;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Invalid sections JSON: ${errorMessage}`);
    }
  }

  const messageBody = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: interactiveType,
      body,
      header,
      footer,
      action,
    },
  } as const;

  // Add reply context if replying to a message
  if (replyToMessageId) {
    Object.assign(messageBody, {
      context: {
        message_id: replyToMessageId,
      },
    });
  }

  // Clean up undefined values
  const interactive = messageBody.interactive as Record<string, unknown>;
  for (const key of Object.keys(interactive)) {
    if (interactive[key] === undefined) {
      delete interactive[key];
    }
  }

  const response = await ctx.api["POST /:phone_number_id/messages"]({
    phone_number_id: ctx.phoneNumberId,
  }, {
    body: messageBody,
  });

  return await response.json();
}
