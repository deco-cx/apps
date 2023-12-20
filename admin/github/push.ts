import { GithubEventListener } from "../mod.ts";
import { handleChange } from "./handler.ts";

export const pushEventHandler: GithubEventListener<"push"> = {
  events: ["push"],
  handle: async (event, ctx) => {
    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const commitSha = event.after;
    await handleChange(
      owner,
      repo,
      commitSha,
      event.ref === "refs/heads/main",
      ctx,
    );
  },
};
