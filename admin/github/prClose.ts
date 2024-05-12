import { GithubEventListener } from "../mod.ts";
import { handlePrClose } from "./handler.ts";

export const prCloseEventHandler: GithubEventListener<"pull_request"> = {
  events: ["pull_request"],
  handle: async (event, req, ctx) => {
    if (!["closed"].includes(event.action)) {
      return;
    }
    const repo = event.repository.name;
    await handlePrClose(
      repo,
      event.pull_request.head.ref,
      req,
      ctx,
    );
  },
};
