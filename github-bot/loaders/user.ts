import { ProjectUser } from "../types.ts";
import UserPreview from "../preview/User.tsx";

const Preview = UserPreview;
export { Preview };

interface Props {
  /**
   * @title {{githubUsername}} ({{discordId}})
   */
  user: {
    discordId: string;
    githubUsername: string;
  };
}

export default function loader(props: Props): ProjectUser {
  return props.user;
}
