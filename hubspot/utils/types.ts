// Common HubSpot API Types

export interface HubSpotError {
  status: string;
  message: string;
  correlationId?: string;
  category?: string;
  errors?: Array<{
    message: string;
    in?: string;
    code?: string;
  }>;
}

// Pagination Types
export interface Paging {
  next?: {
    after?: string;
    link?: string;
  };
  prev?: {
    before?: string;
    link?: string;
  };
}

export interface PagingRequest {
  limit?: number;
  after?: string;
}

// Generic Property Value
export interface PropertyValue {
  value: string;
  timestamp?: string;
  sourceType?: string;
  sourceId?: string;
  sourceLabel?: string;
}

// CRM Object Types
export interface SimplePublicObjectInput {
  properties: Record<string, string>;
  associations?: Array<{
    to: {
      id: string;
    };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

export interface SimplePublicObject {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  associations?: Record<string, {
    results: Array<{
      id: string;
      type: string;
    }>;
  }>;
}

// Batch Operations
export interface BatchInputSimplePublicObjectId {
  inputs: Array<{
    id: string;
    idProperty?: string;
  }>;
  properties?: string[];
  propertiesWithHistory?: string[];
  associations?: string[];
  archived?: boolean;
}

export interface BatchResponseSimplePublicObject {
  status: string;
  results: SimplePublicObject[];
  requestedAt?: string;
  startedAt: string;
  completedAt: string;
}

export interface BatchResponseSimplePublicObjectWithErrors {
  status: string;
  results: SimplePublicObject[];
  numErrors?: number;
  errors?: Array<{
    id: string;
    error: HubSpotError;
  }>;
  requestedAt?: string;
  startedAt: string;
  completedAt: string;
}

// Search Types
export interface Filter {
  propertyName: string;
  operator:
    | "EQ"
    | "NEQ"
    | "LT"
    | "LTE"
    | "GT"
    | "GTE"
    | "BETWEEN"
    | "IN"
    | "NOT_IN"
    | "HAS_PROPERTY"
    | "NOT_HAS_PROPERTY"
    | "CONTAINS_TOKEN"
    | "NOT_CONTAINS_TOKEN";
  value?: string | number;
  values?: Array<string | number>;
  highValue?: string | number;
}

export interface FilterGroup {
  filters: Filter[];
}

export interface SearchRequest {
  filterGroups?: FilterGroup[];
  sorts?: Array<{
    propertyName: string;
    direction: "ASCENDING" | "DESCENDING";
  }>;
  query?: string;
  properties?: string[];
  limit?: number;
  after?: string;
}

export interface SearchResponse {
  total: number;
  results: SimplePublicObject[];
  paging?: Paging;
}

// Property Types
export interface Property {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  description?: string;
  groupName?: string;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    displayOrder?: number;
    hidden?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
  displayOrder?: number;
  calculated?: boolean;
  externalOptions?: boolean;
  hasUniqueValue?: boolean;
  hidden?: boolean;
  hubspotDefined?: boolean;
  showCurrencySymbol?: boolean;
  modificationMetadata?: {
    archivable: boolean;
    readOnlyDefinition: boolean;
    readOnlyValue: boolean;
  };
}

// OAuth Types
export interface TokenRequest {
  grant_type: "authorization_code" | "refresh_token";
  code?: string;
  redirect_uri?: string;
  client_id: string;
  client_secret: string;
  refresh_token?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AccessTokenInfo {
  token: string;
  user_id: number;
  hub_id: number;
  app_id: number;
  expires_at: number;
  user: string;
  scopes: string[];
}

export interface RefreshTokenInfo {
  token: string;
  user_id: number;
  hub_id: number;
  app_id: number;
  expires_at: number;
  user: string;
  scopes: string[];
}

// Marketing Types
export interface Form {
  id: string;
  name: string;
  action: string;
  method: string;
  cssClass: string;
  redirect: string;
  submitText: string;
  followUpId: string;
  notifyRecipients: string;
  leadNurturingCampaignId: string;
  formFieldGroups: Array<{
    fields: Array<{
      name: string;
      label: string;
      type: string;
      fieldType: string;
      description?: string;
      defaultValue?: string;
      isRequired: boolean;
      enabled: boolean;
      hidden: boolean;
      dependentFieldFilters?: Array<{
        filters: Array<{
          operator: string;
          strValue: string;
          boolValue: boolean;
          numberValue: number;
          strValues: string[];
        }>;
        dependentFormField: {
          name: string;
        };
      }>;
      validation?: {
        name: string;
        message: string;
        data?: string;
        useDefaultBlockList?: boolean;
        blockedEmailAddresses?: string[];
      };
    }>;
    default: boolean;
    isSmartGroup: boolean;
    richText?: {
      content: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  performableHtml: string;
  migratedFrom?: string;
  ignoreCurrentValues: boolean;
  metaData: Array<{
    name: string;
    value: string;
  }>;
  deletable: boolean;
  inlineMessage: string;
  tmsId: string;
  captchaEnabled: boolean;
  campaignGuid: string;
  cloneable: boolean;
  editable: boolean;
  formType: string;
  archived: boolean;
  themeName: string;
  parentId?: string;
  style: string;
  isPublished: boolean;
  publishAt: number;
  unpublishAt: number;
  publishedUrl: string;
  lifecycleStage: string;
  thankYouMessageJson: string;
  language: string;
}

// Email Types
export interface TransactionalEmailSendRequest {
  emailId: number;
  message: {
    to: string;
    from?: string;
    replyTo?: string[];
    cc?: string[];
    bcc?: string[];
  };
  contactProperties?: Record<string, string>;
  customProperties?: Record<string, unknown>;
  sendId?: string;
}

export interface TransactionalEmailSendResponse {
  sendResult: "SENT" | "IDEMPOTENT_IGNORE" | "QUEUED" | "NOT_SENT";
  sendId: string;
}

// Custom Objects and Schemas Types
export interface ObjectSchema {
  id?: string;
  name: string;
  labels: {
    singular: string;
    plural: string;
  };
  description?: string;
  primaryDisplayProperty?: string;
  secondaryDisplayProperties?: string[];
  searchableProperties?: string[];
  requiredProperties?: string[];
  properties?: ObjectProperty[];
  associatedObjects?: string[];
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
  fullyQualifiedName?: string;
  objectTypeId?: string;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ObjectProperty {
  name: string;
  label: string;
  type: "string" | "number" | "bool" | "datetime" | "date" | "enumeration";
  fieldType:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "booleancheckbox";
  description?: string;
  groupName?: string;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    displayOrder?: number;
    hidden?: boolean;
  }>;
  displayOrder?: number;
  hasUniqueValue?: boolean;
  hidden?: boolean;
  required?: boolean;
  calculated?: boolean;
  externalOptions?: boolean;
  referencedObjectType?: string;
  textDisplayHint?: string;
  numberDisplayHint?: "formatted" | "unformatted";
  showCurrencySymbol?: boolean;
}

export interface CustomObjectInput {
  name: string;
  labels: {
    singular: string;
    plural: string;
  };
  description?: string;
  primaryDisplayProperty?: string;
  secondaryDisplayProperties?: string[];
  searchableProperties?: string[];
  requiredProperties?: string[];
  properties?: ObjectPropertyInput[];
  associatedObjects?: string[];
}

export interface ObjectPropertyInput {
  name: string;
  label: string;
  type: "string" | "number" | "bool" | "datetime" | "date" | "enumeration";
  fieldType:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "booleancheckbox";
  description?: string;
  groupName?: string;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    displayOrder?: number;
    hidden?: boolean;
  }>;
  displayOrder?: number;
  hasUniqueValue?: boolean;
  hidden?: boolean;
  required?: boolean;
  referencedObjectType?: string;
  textDisplayHint?: string;
  numberDisplayHint?: "formatted" | "unformatted";
  showCurrencySymbol?: boolean;
}

export interface SchemasResponse {
  results: ObjectSchema[];
  paging?: Paging;
}

// Leads Types
export interface Lead {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface LeadsResponse {
  results: Lead[];
  paging?: Paging;
}

// Orders Types
export interface Order {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface OrdersResponse {
  results: Order[];
  paging?: Paging;
}

// Invoices Types
export interface Invoice {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface InvoicesResponse {
  results: Invoice[];
  paging?: Paging;
}

// Users/Owners Types
export interface Owner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
  teams?: Array<{
    id: string;
    name: string;
    membership: "CHILD" | "PARENT";
    primary: boolean;
  }>;
}

export interface OwnersResponse {
  results: Owner[];
  paging?: Paging;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  primaryTeamId?: string;
  sendWelcomeEmail?: boolean;
  superAdmin?: boolean;
}

export interface UsersResponse {
  results: User[];
  paging?: Paging;
}

// Business Units Types
export interface BusinessUnit {
  id: string;
  name: string;
  logoFileManagerKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessUnitsResponse {
  results: BusinessUnit[];
}

// Communication Preferences Types
export interface CommunicationPreferences {
  subscriptions: Array<{
    id: string;
    name: string;
    description?: string;
    status: "SUBSCRIBED" | "UNSUBSCRIBED" | "NOT_OPTED_IN";
    sourceOfStatus:
      | "SUBSCRIPTION_STATUS"
      | "PORTAL_WIDE_STATUS"
      | "BRAND_WIDE_STATUS";
    brandId?: number;
    preferenceGroupName?: string;
    legalBasis?:
      | "LEGITIMATE_INTEREST_PQL"
      | "LEGITIMATE_INTEREST_CLIENT"
      | "LEGITIMATE_INTEREST_OTHER"
      | "PERFORMANCE_OF_CONTRACT"
      | "CONSENT_WITH_NOTICE"
      | "NON_GDPR"
      | "PROCESS_AND_STORE";
    legalBasisExplanation?: string;
  }>;
}

// CMS Types
export interface CMSPage {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  absoluteUrl?: string;
  htmlTitle?: string;
  metaDescription?: string;
  publishDate?: string;
  currentState: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
}

export interface CMSPagesResponse {
  results: CMSPage[];
  paging?: Paging;
}

export interface BlogPost {
  id: string;
  name: string;
  slug: string;
  postSummary?: string;
  postBody?: string;
  htmlTitle?: string;
  metaDescription?: string;
  publishDate?: string;
  currentState: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  authorName?: string;
  tagIds?: string[];
  topicIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
}

export interface BlogPostsResponse {
  results: BlogPost[];
  paging?: Paging;
}

export interface HubDBTable {
  id: string;
  name: string;
  label: string;
  columns: Array<{
    id: string;
    name: string;
    label: string;
    type:
      | "TEXT"
      | "NUMBER"
      | "URL"
      | "IMAGE"
      | "SELECT"
      | "MULTI_SELECT"
      | "BOOLEAN"
      | "LOCATION"
      | "DATE"
      | "DATETIME"
      | "CURRENCY"
      | "JSON";
    options?: Array<{
      id: string;
      name: string;
      type: string;
      order: number;
    }>;
  }>;
  publishedAt?: string;
  rowCount?: number;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
}

export interface HubDBTablesResponse {
  results: HubDBTable[];
  paging?: Paging;
}

// Import/Export Types
export interface ImportRequest {
  name: string;
  files: Array<{
    fileName: string;
    fileImportPage: {
      hasHeader: boolean;
      columnMappings: Array<{
        columnObjectTypeId?: string;
        columnName: string;
        propertyName: string;
        associationIdentifierColumn?: boolean;
        idColumnType?: "HUBSPOT_OBJECT_ID" | "UNIQUE_PROPERTY_VALUE";
      }>;
    };
  }>;
  marketableContactImport?: boolean;
  optOutImport?: boolean;
}

export interface ImportStatus {
  id: string;
  state: "STARTED" | "PROCESSING" | "DONE" | "FAILED" | "CANCELED" | "DEFERRED";
  createdAt: string;
  metadata: {
    objectLists: Array<{
      objectType: string;
      listId: string;
    }>;
    counters: {
      TOTAL_ROWS: number;
      CREATED_OBJECTS: number;
      UPDATED_OBJECTS: number;
      ERROR_ROWS: number;
    };
  };
}

export interface ExportRequest {
  exportType: "VIEW" | "ALL";
  format: "CSV" | "XLSX";
  objectType: string;
  objectProperties?: string[];
  associatedObjectType?: string;
  associatedObjectProperties?: string[];
  publicObjectSearchRequest?: SearchRequest;
}

export interface ExportStatus {
  id: string;
  state: "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";
  createdAt: string;
  format: "CSV" | "XLSX";
  downloadUrl?: string;
  expiresAt?: string;
}

// E-commerce Types
export interface Cart {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface CartsResponse {
  results: Cart[];
  paging?: Paging;
}

export interface Fee {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface FeesResponse {
  results: Fee[];
  paging?: Paging;
}

export interface Discount {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface DiscountsResponse {
  results: Discount[];
  paging?: Paging;
}

export interface Tax {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface TaxesResponse {
  results: Tax[];
  paging?: Paging;
}

export interface Payment {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface PaymentsResponse {
  results: Payment[];
  paging?: Paging;
}

export interface Subscription {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface SubscriptionsResponse {
  results: Subscription[];
  paging?: Paging;
}
