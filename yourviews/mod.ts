import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { App, FnContext } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { YourViews } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
    YVStoreKey: string;
}

export interface State {
    api: ReturnType<typeof createHttpClient<YourViews>>
}

export default function App({ YVStoreKey } : Props) {


    console.log(YVStoreKey)
    const api = createHttpClient<YourViews>({
        base: `https://service.yourviews.com.br/`,
        fetcher: fetchSafe,
        headers: new Headers({
            "YVStoreKey": YVStoreKey,
        })
    })

    const state = {
        api
    }

    const app: App<Manifest, typeof state> = {
        state,
        manifest: {
          ...manifest,
        },
    };

    return app;
}