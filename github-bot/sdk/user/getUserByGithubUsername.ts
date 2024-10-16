import type { AppContext } from "../../mod.ts";
import getAllUsers from "./getAllUsers.ts";

interface Props {
  username: string;
}

export default async function getUserByGithubUsername(
  props: Props,
  ctx: AppContext,
) {
  const users = await getAllUsers(ctx);
  const user = users.find((user) => user.githubUsername === props.username);

  return user;
}
