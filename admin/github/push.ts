import { GithubEventListener } from "../mod.ts";
import { handleChange } from "./handler.ts";

export const pushEventHandler: GithubEventListener<"push"> = {
  events: ["push"],
  handle: async (event, req, ctx) => {
    const isMain = event.ref === "refs/heads/main";
    if (!isMain) {
      return;
    }
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const commitSha = event.after;
    await handleChange(
      owner,
      repo,
      commitSha,
      true,
      req,
      ctx,
    );
  },
};
