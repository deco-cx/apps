import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { GoogleAuthClient, GoogleSheetsClient } from "./utils/client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title API Key
   * @description Chave de API do Google Sheets
   */
  apiKey?: string | Secret;
  accessToken?: string | Secret;
  auth: {
    clientId: string;
    clientSecret: Secret;
    redirectUri: string;
  };
}

export interface State extends Props {
  clientAuth: ReturnType<typeof createHttpClient<GoogleAuthClient>>;
  clientSheets: ReturnType<typeof createHttpClient<GoogleSheetsClient>>;
}
/**
 * @title Google Sheets
 * @description Integração com a API Google Sheets para criar, ler e modificar planilhas
 * @category Produtividade
 * @logo https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/1498px-Google_Sheets_logo_%282014-2020%29.svg.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { auth, apiKey } = props;

  // Extração dos valores secretos
  const _apiKey = typeof apiKey === "string"
    ? apiKey
    : apiKey?.get?.() ?? undefined;

  const _clientSecret = typeof auth.clientSecret === "string"
    ? auth.clientSecret
    : auth.clientSecret?.get?.() ?? undefined;


  const clientAuth = createHttpClient<GoogleAuthClient>({
    base: "https://oauth2.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    fetcher: fetchSafe,
  });


  // Criação do cliente HTTP
  const clientSheets = createHttpClient<GoogleSheetsClient>({
    base: "https://sheets.googleapis.com",
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
    }),
    fetcher: fetchSafe,
  });


  const state: State = {
    clientAuth,
    clientSheets,
    apiKey: _apiKey,
    auth: {
      clientId: props.auth.clientId,
      clientSecret: props.auth.clientSecret,
      redirectUri: props.auth.redirectUri,
    },
  };

  return {
    state,
    manifest,
  };
}
