# HubSpot Integration App

Complete integration with HubSpot APIs including CRM, Marketing, and OAuth functionality. This app provides comprehensive access to HubSpot's platform through a unified interface.

## Features

### 🔐 Authentication
- **OAuth 2.0 Support**: Full OAuth flow implementation
- **Private App Tokens**: Support for HubSpot Private App access tokens
- **Token Management**: Token refresh and metadata retrieval

### 📊 CRM Operations
- **Contacts Management**: Create, read, update, delete, search, and batch operations
- **Companies Management**: Full CRUD operations for company objects
- **Deals Management**: Deal lifecycle management with advanced search
- **Tickets**: Complete support ticket management system
- **Tasks**: Task creation and management
- **Notes**: Note-taking and annotation system
- **Meetings**: Meeting scheduling and management
- **Calls**: Call logging and tracking
- **Products**: Product catalog management
- **Quotes**: Quote creation and management
- **Line Items**: E-commerce line item handling
- **Properties**: Dynamic property retrieval for all object types
- **Lists**: Contact list management and operations
- **Pipelines**: Sales pipeline and stage management
- **Associations**: Object relationship management
- **Advanced Search**: Complex filtering and sorting capabilities
- **Batch Operations**: Efficient bulk operations for better performance

### 📧 Marketing
- **Forms**: Retrieve marketing forms and form details
- **Transactional Emails**: Send personalized transactional emails
- **Marketing Emails**: Campaign email management
- **Campaigns**: Marketing campaign analytics and management
- **Email Templates**: Access to email template management

### 🔔 Webhooks & Real-time
- **Webhook Management**: Create, list, and delete webhook subscriptions
- **Real-time Notifications**: Receive instant updates on CRM changes
- **Event Subscriptions**: Subscribe to specific object and property changes

### 📁 Files & Assets
- **File Upload**: Upload files to HubSpot with access control
- **File Management**: List, retrieve, and organize files
- **Asset Organization**: Folder-based file organization

### 📈 Events & Analytics
- **Custom Events**: Send behavioral events for analytics
- **Event Definitions**: Manage custom event schemas
- **Analytics Tracking**: Track user interactions and behaviors

### 🤖 Automation & Workflows
- **Workflow Management**: Access automation workflows
- **Contact Enrollment**: Enroll contacts in workflows
- **Automation Triggers**: Trigger automated sequences

### 💬 Conversations & Support
- **Conversation Management**: Access chat and conversation threads
- **Message Handling**: Send and receive messages
- **Support Integration**: Complete support ticket system

### ⚙️ Settings & Configuration
- **Account Information**: Retrieve account settings and details
- **Portal Configuration**: Access portal-level settings

## Configuration

### Option 1: Private App Token (Recommended for server-to-server)

```typescript
{
  "apiKey": "your-private-app-token",
  "portalId": "your-portal-id"
}
```

### Option 2: OAuth Credentials (For user authentication)

```typescript
{
  "clientId": "your-oauth-client-id",
  "clientSecret": "your-oauth-client-secret",
  "redirectUri": "your-redirect-uri",
  "portalId": "your-portal-id"
}
```

## Available Loaders

### CRM Loaders

#### Get Contact
Retrieve a specific contact by ID with optional properties and associations.

```typescript
// hubspot/loaders/crm/getContact.ts
{
  "contactId": "123",
  "properties": ["email", "firstname", "lastname"],
  "associations": ["companies", "deals"]
}
```

#### Get Contacts
List contacts with pagination support.

```typescript
// hubspot/loaders/crm/getContacts.ts
{
  "limit": 50,
  "properties": ["email", "firstname", "lastname"],
  "after": "cursor-token"
}
```

#### Search Contacts
Advanced contact search with filters and sorting.

```typescript
// hubspot/loaders/crm/searchContacts.ts
{
  "filterGroups": [{
    "filters": [{
      "propertyName": "email",
      "operator": "CONTAINS_TOKEN",
      "value": "@company.com"
    }]
  }],
  "properties": ["email", "firstname", "lastname"],
  "sorts": [{
    "propertyName": "createdate",
    "direction": "DESCENDING"
  }],
  "limit": 25
}
```

#### Get Company
Retrieve a specific company by ID.

```typescript
// hubspot/loaders/crm/getCompany.ts
{
  "companyId": "123",
  "properties": ["name", "domain", "industry"]
}
```

#### Get Properties
Retrieve all available properties for a CRM object type.

```typescript
// hubspot/loaders/crm/getProperties.ts
{
  "objectType": "contacts",
  "archived": false
}
```

#### Get Tickets
Retrieve support tickets with pagination.

```typescript
// hubspot/loaders/crm/getTickets.ts
{
  "limit": 25,
  "properties": ["subject", "hs_ticket_priority", "hubspot_owner_id"]
}
```

#### Get Tasks
List tasks and activities.

```typescript
// hubspot/loaders/crm/getTasks.ts
{
  "limit": 50,
  "properties": ["hs_task_subject", "hs_task_status", "hs_task_type"]
}
```

#### Get Lists
Retrieve contact lists.

```typescript
// hubspot/loaders/crm/getLists.ts
{
  "limit": 20,
  "listType": "STATIC"
}
```

#### Get Pipelines
Access sales pipelines and stages.

```typescript
// hubspot/loaders/crm/getPipelines.ts
{
  "objectType": "deals"
}
```

#### Get Associations
Retrieve object relationships.

```typescript
// hubspot/loaders/crm/getAssociations.ts
{
  "fromObjectType": "contacts",
  "fromObjectId": "12345",
  "toObjectType": "deals"
}
```

### Marketing Loaders

#### Get Forms
Retrieve marketing forms with filtering options.

```typescript
// hubspot/loaders/marketing/getForms.ts
{
  "limit": 20,
  "formTypes": ["hubspot", "embedded_hubspot"]
}
```

#### Get Form
Retrieve a specific form by ID.

```typescript
// hubspot/loaders/marketing/getForm.ts
{
  "formId": "form-uuid"
}
```

### OAuth Loaders

#### Get Token Info
Retrieve metadata about an OAuth access token.

```typescript
// hubspot/loaders/oauth/getTokenInfo.ts
{
  "token": "your-access-token"
}
```

### Webhooks Loaders

#### Get Webhooks
List all configured webhook subscriptions.

```typescript
// hubspot/loaders/webhooks/getWebhooks.ts
{}
```

### Files Loaders

#### Get Files
List files in HubSpot with filtering.

```typescript
// hubspot/loaders/files/getFiles.ts
{
  "limit": 50,
  "parentFolderId": "folder-id",
  "archived": false
}
```

#### Get File
Retrieve specific file metadata.

```typescript
// hubspot/loaders/files/getFile.ts
{
  "fileId": "file-123"
}
```

### Events Loaders

#### Get Event Definitions
Retrieve custom event schema definitions.

```typescript
// hubspot/loaders/events/getEventDefinitions.ts
{}
```

### Automation Loaders

#### Get Workflows
List automation workflows.

```typescript
// hubspot/loaders/automation/getWorkflows.ts
{
  "limit": 25,
  "offset": 0
}
```

### Conversations Loaders

#### Get Conversations
Retrieve conversation threads.

```typescript
// hubspot/loaders/conversations/getConversations.ts
{
  "limit": 20,
  "state": "OPEN",
  "startTimestamp": 1640995200000
}
```

### Settings Loaders

#### Get Account
Retrieve account information and settings.

```typescript
// hubspot/loaders/settings/getAccount.ts
{}
```

## Available Actions

### CRM Actions

#### Create Contact
Create a new contact in HubSpot.

```typescript
// hubspot/actions/crm/createContact.ts
{
  "properties": {
    "email": "contact@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "company": "Example Corp"
  },
  "associations": [{
    "to": { "id": "company-id" },
    "types": [{
      "associationCategory": "HUBSPOT_DEFINED",
      "associationTypeId": 1
    }]
  }]
}
```

#### Update Contact
Update an existing contact.

```typescript
// hubspot/actions/crm/updateContact.ts
{
  "contactId": "123",
  "properties": {
    "email": "newemail@example.com",
    "phone": "+1234567890"
  }
}
```

#### Delete Contact
Archive/delete a contact.

```typescript
// hubspot/actions/crm/deleteContact.ts
{
  "contactId": "123"
}
```

#### Batch Create Contacts
Create multiple contacts in a single operation.

```typescript
// hubspot/actions/crm/batchCreateContacts.ts
{
  "inputs": [
    {
      "properties": {
        "email": "contact1@example.com",
        "firstname": "John",
        "lastname": "Doe"
      }
    },
    {
      "properties": {
        "email": "contact2@example.com",
        "firstname": "Jane",
        "lastname": "Smith"
      }
    }
  ]
}
```

#### Create Company
Create a new company.

```typescript
// hubspot/actions/crm/createCompany.ts
{
  "properties": {
    "name": "Example Corp",
    "domain": "example.com",
    "industry": "Technology"
  }
}
```

#### Create Deal
Create a new deal.

```typescript
// hubspot/actions/crm/createDeal.ts
{
  "properties": {
    "dealname": "New Business Deal",
    "amount": "50000",
    "dealstage": "prospecting",
    "pipeline": "default"
  }
}
```

#### Update Deal
Update an existing deal.

```typescript
// hubspot/actions/crm/updateDeal.ts
{
  "dealId": "12345",
  "properties": {
    "dealstage": "closedwon",
    "amount": "75000"
  }
}
```

#### Create Ticket
Create a support ticket.

```typescript
// hubspot/actions/crm/createTicket.ts
{
  "properties": {
    "subject": "Customer Support Request",
    "hs_ticket_priority": "HIGH",
    "content": "Customer needs help with login issues"
  }
}
```

#### Create Task
Create a new task.

```typescript
// hubspot/actions/crm/createTask.ts
{
  "properties": {
    "hs_task_subject": "Follow up with lead",
    "hs_task_body": "Call to discuss next steps",
    "hs_task_type": "CALL",
    "hs_timestamp": "1640995200000"
  }
}
```

#### Create Note
Add a note to CRM.

```typescript
// hubspot/actions/crm/createNote.ts
{
  "properties": {
    "hs_note_body": "Important discussion about project requirements"
  },
  "associations": [{
    "to": { "id": "contact-123" },
    "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 1 }]
  }]
}
```

#### Add to List
Add contacts to a static list.

```typescript
// hubspot/actions/crm/addToList.ts
{
  "listId": 12345,
  "emails": ["contact@example.com", "lead@company.com"]
}
```

#### Create Association
Link objects together.

```typescript
// hubspot/actions/crm/createAssociation.ts
{
  "fromObjectType": "contacts",
  "fromObjectId": "12345",
  "toObjectType": "deals",
  "toObjectId": "67890"
}
```

### Marketing Actions

#### Send Transactional Email
Send a personalized transactional email.

```typescript
// hubspot/actions/marketing/sendTransactionalEmail.ts
{
  "emailId": 12345,
  "to": "recipient@example.com",
  "contactProperties": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "customProperties": {
    "order_number": "ORD-123456",
    "total_amount": "$99.99"
  }
}
```

### OAuth Actions

#### Refresh Token
Refresh an OAuth access token using a refresh token.

```typescript
// hubspot/actions/oauth/refreshToken.ts
{
  "refreshToken": "your-refresh-token"
}
```

### Webhooks Actions

#### Create Webhook
Set up real-time notifications.

```typescript
// hubspot/actions/webhooks/createWebhook.ts
{
  "eventType": "contact.creation",
  "active": true
}
```

#### Delete Webhook
Remove a webhook subscription.

```typescript
// hubspot/actions/webhooks/deleteWebhook.ts
{
  "webhookId": "webhook-123"
}
```

### Files Actions

#### Upload File
Upload files to HubSpot.

```typescript
// hubspot/actions/files/uploadFile.ts
{
  "file": "base64-encoded-file-content",
  "fileName": "document.pdf",
  "access": "PRIVATE",
  "folderId": "folder-123"
}
```

### Events Actions

#### Send Custom Event
Track behavioral events.

```typescript
// hubspot/actions/events/sendCustomEvent.ts
{
  "eventName": "product_viewed",
  "email": "user@example.com",
  "properties": {
    "product_id": "ABC123",
    "price": 99.99,
    "category": "electronics"
  }
}
```

### Automation Actions

#### Enroll in Workflow
Add contacts to automation workflows.

```typescript
// hubspot/actions/automation/enrollInWorkflow.ts
{
  "workflowId": "workflow-123",
  "email": "contact@example.com"
}
```

### Conversations Actions

#### Send Message
Send messages in conversation threads.

```typescript
// hubspot/actions/conversations/sendMessage.ts
{
  "threadId": "thread-123",
  "type": "MESSAGE",
  "text": "Thank you for contacting support. How can I help you today?"
}
```

## Common Use Cases

### 1. Contact Management Workflow

```typescript
// 1. Search for existing contacts
const searchResult = await searchContacts({
  filterGroups: [{
    filters: [{
      propertyName: "email",
      operator: "EQ", 
      value: "contact@example.com"
    }]
  }]
});

// 2. Create contact if not exists
if (searchResult.total === 0) {
  const newContact = await createContact({
    properties: {
      email: "contact@example.com",
      firstname: "John",
      lastname: "Doe"
    }
  });
}

// 3. Update contact information
await updateContact({
  contactId: "123",
  properties: {
    lastcontactdate: new Date().toISOString()
  }
});
```

### 2. Lead Qualification Process

```typescript
// 1. Get form submissions
const forms = await getForms({ limit: 10 });

// 2. Create contacts from form data
const contacts = await batchCreateContacts({
  inputs: formSubmissions.map(submission => ({
    properties: {
      email: submission.email,
      firstname: submission.firstname,
      lastname: submission.lastname,
      lead_source: "website_form"
    }
  }))
});

// 3. Create associated deals
for (const contact of contacts.results) {
  await createDeal({
    properties: {
      dealname: `Deal for ${contact.properties.firstname}`,
      amount: "0",
      dealstage: "prospecting"
    },
    associations: [{
      to: { id: contact.id },
      types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }]
    }]
  });
}
```

### 3. Email Campaign Follow-up

```typescript
// 1. Get contacts from specific campaign
const campaignContacts = await searchContacts({
  filterGroups: [{
    filters: [{
      propertyName: "recent_campaign",
      operator: "EQ",
      value: "summer_promo"
    }]
  }],
  properties: ["email", "firstname", "lastname"]
});

// 2. Send personalized follow-up emails
for (const contact of campaignContacts.results) {
  await sendTransactionalEmail({
    emailId: 67890,
    to: contact.properties.email,
    contactProperties: {
      firstname: contact.properties.firstname,
      lastname: contact.properties.lastname
    },
    customProperties: {
      campaign_name: "Summer Promo Follow-up"
    }
  });
}
```

## Error Handling

The app includes comprehensive error handling with specific error types:

```typescript
import { HubSpotAPIError } from "./utils/client.ts";

try {
  const contact = await createContact({ properties: { email: "test@example.com" } });
} catch (error) {
  if (error instanceof HubSpotAPIError) {
    console.error("HubSpot API Error:", {
      status: error.status,
      message: error.hubspotError.message,
      correlationId: error.correlationId
    });
  }
}
```

## Rate Limiting

HubSpot APIs have rate limits. The client includes built-in retry logic and respects HubSpot's rate limiting headers. Monitor your usage and consider:

- Using batch operations when possible
- Implementing exponential backoff for retries
- Caching frequently accessed data

## Security Best Practices

1. **Use Private App Tokens** for server-to-server integrations
2. **Secure OAuth Secrets** - never expose client secrets in frontend code
3. **Scope Permissions** - only request necessary scopes
4. **Token Rotation** - regularly refresh OAuth tokens
5. **Audit Logs** - monitor API usage and access patterns

## Support

For questions and support:
- Review [HubSpot API Documentation](https://developers.hubspot.com/docs/api)
- Check [HubSpot Developer Forums](https://community.hubspot.com/t5/HubSpot-Developers/ct-p/developers)
- View API rate limits and usage in your HubSpot developer dashboard

## Contributing

When extending this app:
1. Follow the existing file structure
2. Add comprehensive TypeScript types
3. Include proper error handling
4. Update this README with new functionality
5. Add examples for complex use cases 