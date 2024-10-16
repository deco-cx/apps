import { isResolvable } from "@deco/deco";
import type { AppContext } from "../../mod.ts";
import type { ProjectUser } from "../../types.ts";

const USER_RESOLVE_TYPE = "github-bot/loaders/user.ts";

interface UserResolvable {
  __resolveType: typeof USER_RESOLVE_TYPE;
  user: ProjectUser;
}

export default async function getAllUsers(ctx: AppContext) {
  const resolvables = await ctx.get<Record<string, UserResolvable>>({
    __resolveType: "resolvables",
  });

  const projectUsers = ctx.projects
    .flatMap((project) => project.users)
    .filter((user, index, arr) =>
      "githubUsername" in user &&
      arr.findIndex((u) => u.githubUsername === user.githubUsername) === index
    );

  const users = Object
    .values(resolvables)
    .filter((value) =>
      isResolvable(value) &&
      value.__resolveType === USER_RESOLVE_TYPE &&
      value.user?.githubUsername &&
      value.user?.discordId &&
      !projectUsers.some((user) =>
        user.githubUsername === value.user?.githubUsername
      )
    )
    .map(({ user }) => user);

  return [...users, ...projectUsers];
}
