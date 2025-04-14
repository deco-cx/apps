import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { GoogleSlidesClient } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
    /**
     * @title OAuth Client ID
     * @description The OAuth 2.0 client ID from Google Cloud Console
     */
    clientId: string;

    /**
     * @title OAuth Client Secret
     * @description The OAuth 2.0 client secret from Google Cloud Console
     */
    clientSecret: string | Secret;

    /**
     * @title Access Token
     * @description OAuth 2.0 access token for Google Slides API
     */
    accessToken?: string | Secret;
}

export interface State extends Props {
    api: ReturnType<typeof createHttpClient<GoogleSlidesClient>>;
}

/**
 * @title Google Slides App
 * @description Create and manage Google Slides presentations programmatically
 * @category Content Management
 * @logo https://www.gstatic.com/images/branding/product/1x/slides_48dp.png
 */
export default function GoogleSlides(props: Props): App<Manifest, State> {
    const { clientId, clientSecret, accessToken } = props;

    const _accessToken = typeof accessToken === "string"
        ? accessToken
        : accessToken?.get?.() ?? "";

    const api = createHttpClient<GoogleSlidesClient>({
        base: "https://slides.googleapis.com",
        headers: new Headers({
            "Authorization": `Bearer ${_accessToken}`,
            "Content-Type": "application/json",
        }),
    });

    const state = {
        ...props,
        api,
    };

    return {
        state,
        manifest,
    };
} 