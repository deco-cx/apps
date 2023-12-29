import { Repository, User } from "./mod.ts";

export function getOrganization(
  repositories: Repository[],
  repository: string,
) {
  repositories.forEach((repo) => {
    if (repo.repo === repository) return repo.organization;
  });
  return null;
}

/**
 * @description Git hub user
 */
export function getDiscordUsers(users: User[] | undefined, gitLogin: string) {
  users?.forEach((user) => {
    if (user.github_user === gitLogin) return user.discord_user;
  });
  return null;
}
