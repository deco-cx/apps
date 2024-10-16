import type { webhooks as OpenAPIWebhooks } from "npm:@octokit/openapi-webhooks-types";

export type EventKeys = keyof OpenAPIWebhooks;
export type WebhookEvent<
  TEventName extends EventKeys = EventKeys,
> = OpenAPIWebhooks[TEventName]["post"]["requestBody"]["content"][
  "application/json"
];

export type PullRequestEvent = WebhookEvent<
  | "pull-request-opened"
  | "pull-request-closed"
  | "pull-request-edited"
  | "pull-request-review-requested"
>;
export type PullRequestCreatedEvent = WebhookEvent<
  "pull-request-review-submitted"
>;
export type ReviewSubmittedEvent = WebhookEvent<"pull-request-opened">;
