import type { App, FnContext } from "deco/mod.ts";
import { createHttpClient } from "../utils/http.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { API } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

/** @title Coteminas */
export interface Props{
  /**
   * @title Brand Coteminas name
   * @description The name
   * @default mmartan
   */
  account: string;

  /**
   * @description Use Coteminas as backend platform
   */
  platform: "coteminas";
}

export interface State extends Props{
    api: ReturnType<typeof createHttpClient<API>>
}

/**
 * @title Coteminas
 */
export default function App(props: Props): App<Manifest, State>{
    const {account} = props;
    const api = createHttpClient<API>({
        base: `https://${account}.com.br/`
    })
    return {
        state: {...props, api},
        manifest,
    }
}