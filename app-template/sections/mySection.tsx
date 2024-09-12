import { GithubUser } from "../utils/types.ts";

// notice that using the same types from the loaders
// it will be easier to use the data from the loaders
// on deco.cx admin

interface Props {
  user: GithubUser;
}

/**
 * @title This name will appear on the admin
 */
export default function Section(props: Props) {
  return (
    <div>
      <h1>{props.user.login}</h1>
      <img src={props.user.avatar_url} alt="avatar" />
    </div>
  );
}
