export interface WhatsAppProfile {
  name: string;
}

export interface WhatsAppContact {
  profile: WhatsAppProfile;
  wa_id: string;
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppText {
  body: string;
}

export interface WhatsAppImage {
  caption?: string;
  mime_type: string;
  sha256: string;
  id: string;
}

export interface WhatsAppSticker {
  mime_type: string;
  sha256: string;
  id: string;
}

export interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppContactAddress {
  city?: string;
  country?: string;
  country_code?: string;
  state?: string;
  street?: string;
  type?: "HOME" | "WORK";
  zip?: string;
}

export interface WhatsAppContactEmail {
  email: string;
  type?: "WORK" | "HOME";
}

export interface WhatsAppContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface WhatsAppContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

export interface WhatsAppContactPhone {
  phone: string;
  wa_id?: string;
  type?: "HOME" | "WORK";
}

export interface WhatsAppContactUrl {
  url: string;
  type?: "HOME" | "WORK";
}

export interface WhatsAppContactDetails {
  addresses?: WhatsAppContactAddress[];
  birthday?: string;
  emails?: WhatsAppContactEmail[];
  name: WhatsAppContactName;
  org?: WhatsAppContactOrg;
  phones?: WhatsAppContactPhone[];
  urls?: WhatsAppContactUrl[];
}

export interface WhatsAppButton {
  text: string;
  payload: string;
}

export interface WhatsAppListReply {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppButtonReply {
  id: string;
  title: string;
}

export interface WhatsAppInteractive {
  type: "list_reply" | "button_reply";
  list_reply?: WhatsAppListReply;
  button_reply?: WhatsAppButtonReply;
}

export interface WhatsAppReferral {
  source_url: string;
  source_id: string;
  source_type: "ad" | "post";
  headline?: string;
  body?: string;
  media_type?: "image" | "video";
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  ctwa_clid?: string;
}

export interface WhatsAppReferredProduct {
  catalog_id: string;
  product_retailer_id: string;
}

export interface WhatsAppContext {
  from: string;
  id: string;
  referred_product?: WhatsAppReferredProduct;
}

export interface WhatsAppProductItem {
  product_retailer_id: string;
  quantity: string;
  item_price: string;
  currency: string;
}

export interface WhatsAppOrder {
  catalog_id: string;
  product_items: WhatsAppProductItem[];
  text?: string;
}

export interface WhatsAppSystem {
  body: string;
  new_wa_id?: string;
  type: "user_changed_number";
}

export interface WhatsAppReaction {
  message_id: string;
  emoji: string;
}

export interface WhatsAppError {
  code: number;
  title: string;
  details?: string;
  message?: string;
  error_data?: {
    details: string;
  };
  href?: string;
}

export interface WhatsAppConversation {
  id: string;
  expiration_timestamp?: string;
  origin?: {
    type: string;
  };
}

export interface WhatsAppPricing {
  billable: boolean;
  pricing_model: string;
  category: string;
}

export interface WhatsAppStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  conversation?: WhatsAppConversation;
  pricing?: WhatsAppPricing;
  errors?: WhatsAppError[];
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type:
    | "text"
    | "image"
    | "sticker"
    | "location"
    | "contacts"
    | "button"
    | "interactive"
    | "system"
    | "reaction"
    | "order"
    | "unknown";
  text?: WhatsAppText;
  image?: WhatsAppImage;
  sticker?: WhatsAppSticker;
  location?: WhatsAppLocation;
  contacts?: WhatsAppContactDetails[];
  button?: WhatsAppButton;
  interactive?: WhatsAppInteractive;
  referral?: WhatsAppReferral;
  context?: WhatsAppContext;
  order?: WhatsAppOrder;
  system?: WhatsAppSystem;
  reaction?: WhatsAppReaction;
  errors?: WhatsAppError[];
}

export interface WhatsAppEntry {
  id: string;
  changes: {
    value: {
      messaging_product: "whatsapp";
      metadata: WhatsAppMetadata;
      contacts?: WhatsAppContact[];
      messages?: WhatsAppMessage[];
      statuses?: WhatsAppStatus[];
    };
    field: "messages";
  }[];
}

/**
 * WhatsApp webhook interface for receiving incoming messages and status updates
 */
export interface WebhookPayload {
  object?: "whatsapp_business_account";
  entry?: WhatsAppEntry[];
  hub?: {
    mode: string;
    verify_token: string;
    challenge: string;
  };
}

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

/**
 * Media response from WhatsApp
 */
export interface MediaResponse extends WhatsAppResponse {
  url: string;
  mime_type: string;
  sha256: string;
  file_size: string;
  id: string;
}

/**
 * Define message type
 */
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
      contacts?: WhatsAppContactDetails[];
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

  // Retrieve Media URL
  "GET /:media_id": {
    response: MediaResponse;
  };

  // Download Media
  "GET /:media_url": {
    response: {
      data: ArrayBuffer;
      headers: {
        "content-type": string;
      };
    };
  };
}
