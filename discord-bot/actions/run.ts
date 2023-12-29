import { Manifest } from "./../../../runtime.ts";
import { AppContext } from "../mod.ts";
import { WorkflowProps } from "deco-sites/admin/actions/workflows/start.ts";

interface Props {
  repository?: string;
  channel_id?: string;
}

export default async function Run(
  { repository }: Props,
  _req: Request,
  { invoke, repositories, discord_channel_id }: AppContext,
) {
  const startWorkflow = invoke.$live.actions.workflows.start;

  const start = async (repo: string, channel_id: string) => {
    const props: WorkflowProps<
      "deco-sites/admin/workflows/gitPullRequests.ts",
      Manifest
    > = {
      key: "deco-sites/admin/workflows/gitPullRequests.ts",
      props: {
        repo,
        channel_id,
      },
      restart: true,
      id: `${repo}_gitpullrequests_v0`,
    };
    await startWorkflow(props);
  };

  const repos = repository
    ? [repository]
    : repositories.map((repo) => repo.repo);

  for (const repo of repos) {
    await start(repo, discord_channel_id);
  }
}
