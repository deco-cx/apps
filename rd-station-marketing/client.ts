// Types for RD Station Marketing API Client

// Error Types
export interface ErrorResponse {
  errors: {
    error_type: string;
    error_message: string;
  };
}

// Segmentation Types
export interface Segmentation {
  id: number;
  name: string;
  standard: boolean;
  created_at: string;
  updated_at: string;
  process_status: string;
  links: Link[];
}

export interface SegmentationsResponse {
  segmentations: Segmentation[];
}

// Contact Types
export interface Contact {
  uuid: string;
  name: string;
  email: string;
  job_title?: string;
  birthdate?: string;
  bio?: string;
  website?: string;
  personal_phone?: string;
  mobile_phone?: string;
  city?: string;
  state?: string;
  country?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  tags?: string[];
  extra_emails?: string[];
  legal_bases?: LegalBase[];
  links?: Link[];
  last_conversion_date?: string;
  created_at?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
}

export interface CreateContactRequest {
  name?: string;
  email: string;
  job_title?: string;
  birthdate?: string;
  bio?: string;
  website?: string;
  personal_phone?: string;
  mobile_phone?: string;
  city?: string;
  state?: string;
  country?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  tags?: string[];
  legal_bases?: LegalBase[];
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  job_title?: string;
  birthdate?: string;
  bio?: string;
  website?: string;
  personal_phone?: string;
  mobile_phone?: string;
  city?: string;
  state?: string;
  country?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  tags?: string[];
  legal_bases?: LegalBase[];
}

export interface LegalBase {
  category: string;
  type: string;
  status: string;
}

export interface Link {
  rel: string;
  href: string;
  media: string;
  type: string;
}

// API Client Interface
export interface RdStationMarketingClient {
  // Segmentations Endpoints
  "GET /platform/segmentations": {
    response: SegmentationsResponse;
  };

  "GET /platform/segmentations/:id/contacts": {
    response: ContactsResponse;
  };

  // Contacts Endpoints
  "POST /platform/contacts": {
    response: Contact;
    body: CreateContactRequest;
  };

  // Using wildcards to capture full path segments with colons
  "GET /platform/contacts/*identifier": {
    response: Contact;
  };

  "PATCH /platform/contacts/*identifier": {
    response: Contact;
    body: UpdateContactRequest;
  };

  "DELETE /platform/contacts/*identifier": {
    response: void;
  };
}
