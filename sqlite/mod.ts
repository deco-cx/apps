
import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { createClient, Client } from "https://esm.sh/@libsql/client@0.6.0/web";

export interface Props {
  databaseUrl: string;
  authToken: Secret;
};

export interface State {
  client?: Client
}
/**
 * @title sqlite
 */
export default function App(
  state: Props,
): App<Manifest, State> {
  // const decryptedToken = state.authToken.get();

  console.log("creating app with ", state.databaseUrl);
  // FIXME: Couldn't setup a Secret in Admin
  // if (!decryptedToken){
  //   console.error("Couldn't decrypt the database authToken");
  //   return { manifest, state: {} }
  // }

  const client = createClient({
    url: state. databaseUrl,
    // authToken: decryptedToken || Deno.env.get("TURSO_AUTH_TOKEN"),
    authToken: Deno.env.get("TURSO_AUTH_TOKEN"),
  });

  return { manifest, state: {
    ...state,
    client
  } };
}

export type AppContext = AC<ReturnType<typeof App>>;
