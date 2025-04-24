// Types for WhatsApp entities

/**
 * Base response interface for WhatsApp responses
 */
export interface WhatsAppResponse {
  messaging_product: string;
}

/**
 * Message response from the WhatsApp
 */
export interface MessageResponse extends WhatsAppResponse {
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
    message_status?: "accepted" | "held_for_quality_assessment";
  }[];
}

/**
 * Text message object
 */
export interface TextMessage {
  body: string;
  preview_url?: boolean;
}

/**
 * Media object for audio, document, image, sticker, video
 */
export interface Media {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
}

/**
 * Interactive content header
 */
export interface InteractiveHeader {
  type: "text" | "video" | "image" | "document";
  text?: string;
  video?: Media;
  image?: Media;
  document?: Media;
  sub_text?: string;
}

/**
 * Interactive content footer
 */
export interface InteractiveFooter {
  text: string;
}

/**
 * Interactive content body
 */
export interface InteractiveBody {
  text: string;
}

/**
 * Button object for interactive messages
 */
export interface Button {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

/**
 * Row object for list messages
 */
export interface Row {
  id: string;
  title: string;
  description?: string;
}

/**
 * Section object for list messages
 */
export interface Section {
  title?: string;
  rows: Row[];
}

/**
 * Product item for product list messages
 */
export interface ProductItem {
  product_retailer_id: string;
}

/**
 * Product section for multi-product messages
 */
export interface ProductSection {
  title: string;
  product_items: ProductItem[];
}

/**
 * Flow action payload for Flow messages
 */
export interface FlowActionPayload {
  screen?: string;
  data?: Record<string, unknown>;
}

/**
 * Interactive message action
 */
export interface InteractiveAction {
  button?: string;
  buttons?: Button[];
  sections?: Section[];
  catalog_id?: string;
  product_retailer_id?: string;
  flow_id?: string;
  flow_name?: string;
  flow_message_version?: string;
  flow_token?: string;
  flow_cta?: string;
  flow_action?: "navigate" | "data_exchange";
  flow_action_payload?: FlowActionPayload;
  mode?: "draft" | "published";
}

/**
 * Location object
 */
export interface Location {
  longitude: number;
  latitude: number;
  name: string;
  address: string;
}

/**
 * Contact address
 */
export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_code?: string;
  type?: string;
}

/**
 * Contact email
 */
export interface ContactEmail {
  email?: string;
  type?: string;
}

/**
 * Contact name
 */
export interface ContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

/**
 * Contact organization
 */
export interface ContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

/**
 * Contact phone
 */
export interface ContactPhone {
  phone?: string;
  type?: string;
  wa_id?: string;
}

/**
 * Contact URL
 */
export interface ContactUrl {
  url?: string;
  type?: string;
}

/**
 * Contact object
 */
export interface Contact {
  addresses?: ContactAddress[];
  birthday?: string;
  emails?: ContactEmail[];
  name: ContactName;
  org?: ContactOrg;
  phones?: ContactPhone[];
  urls?: ContactUrl[];
}

/**
 * Template parameter type
 */
export interface TemplateParameter {
  type: "text" | "currency" | "date_time" | "image" | "document" | "video";
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: Media;
  document?: Media;
  video?: Media;
}

/**
 * Template component
 */
export interface TemplateComponent {
  type: "header" | "body" | "footer" | "button";
  parameters?: TemplateParameter[];
  sub_type?: "quick_reply" | "url";
  index?: string;
}

/**
 * Template object
 */
export interface Template {
  name: string;
  namespace?: string;
  language: {
    code: string;
    policy?: string;
  };
  components?: TemplateComponent[];
}

// Define message type
export type MessageType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "sticker"
  | "location"
  | "contacts"
  | "interactive"
  | "template"
  | "reaction";

/**
 * WhatsApp Client Interface
 */
export interface WhatsAppClient {
  // Generic messages endpoint that can handle all message types
  "POST /:phone_number_id/messages": {
    response: MessageResponse;
    body: {
      messaging_product: "whatsapp";
      recipient_type?: "individual";
      to: string;
      type: MessageType;
      text?: TextMessage;
      image?: Media;
      audio?: Media;
      video?: Media;
      document?: Media;
      sticker?: Media;
      location?: Location;
      contacts?: Contact[];
      interactive?: {
        type: "button" | "list" | "product" | "product_list" | "flow";
        header?: InteractiveHeader;
        body?: InteractiveBody;
        footer?: InteractiveFooter;
        action: InteractiveAction;
      };
      template?: Template;
      reaction?: {
        message_id: string;
        emoji: string;
      };
      context?: {
        message_id: string;
      };
    };
  };

  // Mark message as read
  "POST /:phone_number_id/messages/mark_read": {
    response: MessageResponse;
    body: {
      messaging_product: "whatsapp";
      status: "read";
      message_id: string;
    };
  };
}
