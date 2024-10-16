import debug from "./debug.ts";
import viewOpenPullRequests from "./viewOpenPullRequests.ts";

export default new Map(
  [debug, viewOpenPullRequests].map((command) => [
    command.data.name,
    command,
  ]),
);
