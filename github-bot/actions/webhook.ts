import { STATUS_CODE } from "@std/http/status";
import type { AppContext } from "../mod.ts";
import onPullRequestMerge from "../sdk/github/events/onPullRequestMerge.ts";
import onPullRequestOpen from "../sdk/github/events/onPullRequestOpen.ts";
import onReviewRequested from "../sdk/github/events/onReviewRequested.ts";
import onReviewSubmitted from "../sdk/github/events/onReviewSubmitted.ts";
import type { WebhookEvent } from "../sdk/github/types.ts";
import { wasInDraft } from "../sdk/github/utils.ts";
import {
  isPingEvent,
  isPullRequestEvent,
  isPullRequestReviewEvent,
} from "../sdk/github/validateWebhookPayload.ts";
import { verify } from "../sdk/github/verifyWebhook.ts";

export default async function action(
  props: WebhookEvent,
  req: Request,
  ctx: AppContext,
) {
  const signature = req.headers.get("x-hub-signature-256");

  if (!signature) {
    console.error("Signature is missing. Request Headers:", req.headers);
    return new Response("Signature is missing", {
      status: STATUS_CODE.Unauthorized,
    });
  }

  if (!("repository" in props) || !props.repository) {
    console.error("Repository is missing. Request Body:", props);
    return new Response("Repository is missing", {
      status: STATUS_CODE.BadRequest,
    });
  }

  const eventName = req.headers.get("x-github-event");
  if (!eventName) {
    console.error("Event name is missing. Request Headers:", req.headers);
    return new Response("Event name is missing", {
      status: STATUS_CODE.BadRequest,
    });
  }

  if (isPingEvent(eventName, props)) {
    return new Response(null, { status: 200 });
  }

  const project = ctx.projects.find(({ github }) =>
    `${github.org_name}/${github.repo_name}` === props.repository!.full_name
  );
  if (!project) {
    console.error("Unknown repository. Request Body:", props);
    return new Response("Unknown repository", {
      status: STATUS_CODE.BadRequest,
    });
  }

  if (!project.active) {
    console.error("Project is not active. Data:", { project, props });
    return new Response("Project is not active", {
      status: STATUS_CODE.ServiceUnavailable,
    });
  }

  const secret = project.github.webhook_secret.get();
  if (!secret) {
    console.error("Secret is missing. Data:", { project, props });
    return new Response("Secret is missing", {
      status: STATUS_CODE.BadRequest,
    });
  }

  if (!(await verify(secret, JSON.stringify(props), signature))) {
    console.error("Invalid signature. Data:", { project, props });
    return new Response("Invalid signature", {
      status: STATUS_CODE.Unauthorized,
    });
  }

  if (isPullRequestEvent(eventName, props)) {
    if (props.action === "opened" || wasInDraft(props)) {
      return onPullRequestOpen(props, project, ctx);
    }

    if (props.action === "closed" && props.pull_request.merged) {
      return onPullRequestMerge(props, project, ctx);
    }

    if (props.action === "review_requested") {
      return onReviewRequested(props, project, ctx);
    }

    console.warn("Unhandled action. Data:", {
      action: props.action,
      project,
      props,
    });
    return new Response(null, { status: STATUS_CODE.NoContent });
  }

  if (isPullRequestReviewEvent(eventName, props)) {
    if (props.action === "submitted") {
      return onReviewSubmitted(props, project, ctx);
    }

    console.warn("Unhandled action. Data:", {
      action: props.action,
      project,
      props,
    });
    return new Response(null, { status: STATUS_CODE.NoContent });
  }

  return new Response(null, { status: 200 });
}
