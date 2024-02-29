import { EmailType, ListResponse, Member, StatusType } from "./types.ts";

export interface API {
  "GET /3.0/lists": {
    response: ListResponse;
    searchParams: {
      fields?: string[];
      exclude_fields?: string[];
      count?: number;
      offset?: number;
      before_date_created?: string;
      since_date_created?: string;
      before_campaign_last_sent?: string;
      since_campaign_last_sent?: string;
      email?: string;
      sort_field?: string;
      sort_dir?: "ASC" | "DESC";
      has_ecommerce_store?: boolean;
      include_total_contacts?: boolean;
    };
  };

  "GET /3.0/lists/:id/members/:hash": {
    response: Member;
    searchParams: {
      fields?: string[];
      exclude_fields?: string[];
    };
  };

  "POST /3.0/lists/:id/members": {
    response: Member;
    searchParams: {
      skip_merge_validation?: boolean;
    };
    body: {
      email_address: string;
      status: StatusType;
      email_type?: EmailType;
      merge_fields?: Record<string, string>;
      interests?: Record<string, boolean>;
      language?: string;
      vip?: boolean;
      location?: {
        latitude: number;
        longitude: number;
      };
      marketing_permissions?: {
        marketing_permission_id: string;
        enabled: boolean;
      }[];
      ip_signup?: string;
      timestamp_signup?: string;
      ip_opt?: string;
      timestamp_opt?: string;
      tags?: string[];
    };
  };

  "PUT /3.0/lists/:id/members/:hash": {
    response: Member;
    searchParams: {
      skip_merge_validation?: boolean;
    };
    body: {
      email_address?: string;
      status_if_new?: StatusType;
      email_type?: EmailType;
      status?: StatusType;
      merge_fields?: Record<string, string>;
      interests?: Record<string, boolean>;
      language?: string;
      vip?: boolean;
      location?: {
        latitude: number;
        longitude: number;
      };
      marketing_permissions?: {
        marketing_permission_id: string;
        enabled: boolean;
      }[];
      ip_signup?: string;
      timestamp_signup?: string;
      ip_opt?: string;
      timestamp_opt?: string;
    };
  };
}
