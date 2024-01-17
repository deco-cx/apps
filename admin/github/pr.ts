import { GithubEventListener } from "../mod.ts";
import { handleChange } from "./handler.ts";

export const prEventHandler: GithubEventListener<"pull_request"> = {
  events: ["pull_request"],
  handle: async (event, req, ctx) => {
    if (!["opened", "synchronize", "reopened"].includes(event.action)) {
      return;
    }
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const commitSha = event.pull_request.head.sha;
    await handleChange(owner, repo, commitSha, false, req, ctx);
  },
};
