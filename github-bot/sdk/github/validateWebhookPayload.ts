import type {
  EventKeys,
  PullRequestEvent,
  WebhookEvent,
} from "../../sdk/github/types.ts";

export function isWebhookEvent<TEventName extends EventKeys = EventKeys>(
  props: unknown,
): props is WebhookEvent<TEventName> {
  return (
    typeof props === "object" &&
    props !== null &&
    !Array.isArray(props) &&
    "action" in props &&
    typeof props.action === "string"
  );
}

enum Events {
  Ping = "ping",
  PullRequest = "pull_request",
  PullRequestReview = "pull_request_review",
  Issues = "issues",
}

export function isPingEvent(
  event: string,
  props: unknown,
): props is WebhookEvent<"ping"> {
  return event === Events.Ping && isWebhookEvent<"ping">(props);
}

export function isPullRequestEvent(
  event: string,
  props: unknown,
): props is PullRequestEvent {
  return (
    event === Events.PullRequest &&
    isWebhookEvent<
      | "pull-request-opened"
      | "pull-request-closed"
      | "pull-request-edited"
      | "pull-request-review-requested"
    >(props)
  );
}

export function isPullRequestReviewEvent(
  event: string,
  props: unknown,
): props is WebhookEvent<
  | "pull-request-review-submitted"
  | "pull-request-review-edited"
  | "pull-request-review-dismissed"
> {
  return (
    event === Events.PullRequestReview &&
    isWebhookEvent<
      | "pull-request-review-submitted"
      | "pull-request-review-edited"
      | "pull-request-review-dismissed"
    >(props)
  );
}

export function isIssuesEvent(
  event: string,
  props: unknown,
): props is WebhookEvent<
  "issues-opened" | "issues-closed" | "issues-reopened"
> {
  return event === Events.Issues &&
    isWebhookEvent<"issues-opened" | "issues-closed" | "issues-reopened">(
      props,
    );
}
