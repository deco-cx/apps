import type { App, FnContext } from "deco/mod.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { ClientInterfaceExample } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Account Name
   * @description erploja2 etc
   */
  account: string;

  /**
   * @title Wake API token
   * @description The token for accessing wake commerce
   */
  token?: Secret;
}

// Here we define the state of the app
// You choose what to put in the state
export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<ClientInterfaceExample>>;
}

/**
 * @title App Template
 * @description This is an template of an app to be used as a reference.
 * @category Tools
 * @logo https://
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, account: _account } = props;

  const _stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<ClientInterfaceExample>({
    base: `https://api.github.com/users/guitavano`,
    // headers: new Headers({ "Authorization": `Bearer ${stringToken}` }),
    fetcher: fetchSafe,
  });

  // it is the state of the app, all data
  // here will be available in the context of
  // loaders, actions and workflows
  const state = { ...props, api };

  return {
    state,
    manifest,
  };
}

// It is important to use the same name as the default export of the app
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "App Template",
      owner: "deco.cx",
      description: "This is an template of an app to be used as a reference.",
      logo: "",
      images: [],
      tabs: [],
    },
  };
};
