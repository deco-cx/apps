import { DiscordCommand } from "../client.ts";
import { AppContext } from "../mod.ts";

// Command containing options
const QUERY_COMMAND: DiscordCommand = {
  name: "pullrequests",
  description: "List the opened pull request",
  options: [
    {
      name: "repo",
      description: "Repository name",
      required: true,
      type: 3,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [QUERY_COMMAND];

export async function InstallGlobalCommands(
  // deno-lint-ignore no-explicit-any
  _props: any,
  _req: unknown,
  { discordClient }: AppContext,
) {
  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordClient["PUT commands"]({}, { body: ALL_COMMANDS });
  } catch (err) {
    console.error(err);
  }
  console.log("Installed global commands for discord's bot successfully");
}
