interface Contact {
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface Link {
  rel: string;
  href: string;
  method: string;
  targetSchema: string;
  schema: string;
}

export interface List {
  id: string;
  web_id: number;
  name: string;
  contact: Contact;
  permission_reminder: string;
  use_archive_bar: boolean;
  campaign_defaults: {
    from_name: string;
    from_email: string;
    subject: string;
    language: string;
  };
  notify_on_subscribe: string;
  notify_on_unsubscribe: string;
  date_created: string;
  list_rating: number;
  email_type_option: boolean;
  subscribe_url_short: string;
  subscribe_url_long: string;
  beamer_address: string;
  visibility: "pub" | "prv";
  double_optin: boolean;
  has_welcome: boolean;
  marketing_permissions: boolean;
  modules: string[];
  stats: {
    member_count: number;
    total_contacts: number;
    unsubscribe_count: number;
    cleaned_count: number;
    member_count_since_send: number;
    unsubscribe_count_since_send: number;
    cleaned_count_since_send: number;
    campaign_count: number;
    campaign_last_sent: string;
    merge_field_count: number;
    avg_sub_rate: number;
    avg_unsub_rate: number;
    target_sub_rate: number;
    open_rate: number;
    last_sub_date: string;
    last_unsub_date: string;
  };
  _links: Link[];
}

export interface ListResponse {
  lists: List[];
  total_items: number;
  constraints: {
    may_create: boolean;
    max_instances: number;
    current_total_instances: number;
  };
  _links: Link[];
}

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface Member {
  id: string;
  email_address: string;
  unique_email_id: string;
  contact_id: string;
  full_name: string;
  web_id: number;
  email_type: EmailType;
  status: StatusType;
  unsubscribe_reason: string;
  consents_to_one_to_one_messaging: boolean;
  merge_fields: Record<string, string>;
  interests: Record<string, boolean>;
  stats: {
    avg_open_rate: number;
    avg_click_rate: number;
  };
  ip_signup: string;
  timestamp_signup: string;
  ip_opt: string;
  timestamp_opt: string;
  member_rating: number;
  last_changed: string;
  language: string;
  vip: boolean;
  email_client: string;
  location: {
    latitude: number;
    longitude: number;
    gmtoff: number;
    dstoff: number;
    country_code: string;
    timezone: string;
  };
  marketing_permissions: {
    marketing_permission_id: string;
    text: string;
    enabled: boolean;
  }[];
  last_note: {
    note_id: number;
    note: string;
    created_at: string;
    created_by: string;
  };
  source: string;
  tags_count: number;
  tags: {
    id: number;
    name: string;
  }[];
  list_id: string;
  _links: Link[];
}

export type StatusType = "subscribed" | "unsubscribed" | "cleaned" | "pending";
export type EmailType = "html" | "text";
