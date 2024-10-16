import { AppContext } from "../mod.ts";

export default function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
) {
  const projects = ctx.projects.map(({ github, users }) => ({
    users,
    github: {
      organization: github.org_name,
      repository: github.repo_name,
    },
  }));

  return projects;
}
